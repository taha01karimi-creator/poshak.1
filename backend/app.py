"""Codelaine backend — Flask application factory (also serves the static site)."""

import os
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

from flask import Flask, abort, request, send_from_directory
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.middleware.proxy_fix import ProxyFix

from config import Config, config_by_name
from security.headers import apply_security_headers
from security.rate_limit import limiter

# Single SQLAlchemy instance for the whole app. models.py imports this object,
# so every model is registered on the same metadata as `db.init_app(app)`.
db = SQLAlchemy()
bcrypt = Bcrypt()

# The static front-end lives in frontend/, next to backend/.
FRONTEND_ROOT = Path(__file__).resolve().parent.parent / "frontend"
FRONTEND_PAGES = {"index.html", "category.html", "admin.html"}
FRONTEND_DIRS = {"css", "js", "images"}
CACHEABLE_SUFFIXES = {".css", ".js"}
STATIC_SUFFIXES = CACHEABLE_SUFFIXES | {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".svg",
    ".gif",
    ".ico",
}

def create_app(config_name: str = "development"):
    """Application factory."""
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    config_class = config_by_name.get(config_name, config_by_name["development"])
    app.config.from_object(config_class)

    # Fail fast on missing secrets — but only when actually starting the app,
    # so importing the module (tests, tooling) stays side-effect free.
    if config_name != "testing":
        config_class.validate()

    # Trust reverse proxy hops *explicitly*. Werkzeug's ProxyFix defaults every
    # axis to one hop, so any client could send its own X-Forwarded-For and show
    # up with a brand-new IP on each request — that alone defeated the login
    # rate limit. TRUSTED_PROXY_HOPS must equal the real proxy chain (1 behind a
    # single nginx/platform edge, 0 when nothing sits in front of the app).
    trusted_hops = int(app.config.get("TRUSTED_PROXY_HOPS") or 0)
    if trusted_hops > 0:
        app.wsgi_app = ProxyFix(
            app.wsgi_app,
            x_for=trusted_hops,
            x_proto=trusted_hops,
            x_host=trusted_hops,
        )

    # Security headers on every response — one source of truth, no duplicates
    @app.after_request
    def add_security_headers(response):
        hsts = bool(app.config.get("HSTS_ENABLED")) and request.is_secure
        return apply_security_headers(response, hsts=hsts)

    # Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)

    # CORS — explicit allow-list only, no wildcard with credentials
    CORS(
        app,
        resources={r"/api/*": {"origins": _cors_origins(app)}},
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
    )

    # Register blueprints (api.api_bp mounts every sub-blueprint)
    from api import api_bp

    app.register_blueprint(api_bp, url_prefix="/api")

    # Health check
    @app.get("/health")
    def health():
        return {
            "status": "ok",
            "service": "digistyle",
            "time": datetime.now(timezone.utc).isoformat(),
        }

    # Static storefront + admin panel (allow-list, never the source tree)
    _register_frontend(app)

    # Import models so their tables are registered on db.metadata, then create
    # them for local/dev runs. Production relies on migrations instead.
    import models  # noqa: F401

    if app.config.get("AUTO_CREATE_TABLES"):
        with app.app_context():
            db.create_all()

            try:
                with db.engine.connect() as conn:
                    conn.execute(db.text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(20)"))
                    conn.commit()
            except Exception:

                try:
                    with db.engine.connect() as conn:
                        conn.execute(db.text("ALTER TABLE orders ADD COLUMN phone VARCHAR(20)"))
                        conn.commit()
                except Exception:
                    pass

    # Optional first-boot seeding (used on Render where there is no shell step).
    if app.config.get("SEED_ON_BOOT"):
        from seed import seed as seed_database

        seed_database(app)

    return app

def _cors_origins(app) -> list[str]:
    """Configured origins plus this service's own Render URL, when present."""
    raw = app.config.get("CORS_ORIGINS") or ""
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    render_url = (os.environ.get("RENDER_EXTERNAL_URL") or "").rstrip("/")
    if render_url and render_url not in origins:
        origins.append(render_url)
    return origins

def _register_frontend(app) -> None:
    """Serve index/category/admin plus css, js and images — nothing else."""

    @app.get("/")
    def frontend_index():
        return send_from_directory(FRONTEND_ROOT, "index.html")

    @app.get("/<path:relpath>")
    def frontend_file(relpath):
        parts = PurePosixPath(relpath).parts
        if len(parts) == 1 and parts[0] in FRONTEND_PAGES:
            return send_from_directory(FRONTEND_ROOT, parts[0])
        suffix = PurePosixPath(parts[-1]).suffix.lower() if parts else ""
        if len(parts) >= 2 and parts[0] in FRONTEND_DIRS and suffix in STATIC_SUFFIXES:
            # Revalidate instead of caching blind: otherwise a CSS/JS update
            # keeps serving the old file from browser cache for an hour.
            max_age = 0 if suffix in CACHEABLE_SUFFIXES else 3600
            return send_from_directory(
                FRONTEND_ROOT, PurePosixPath(*parts).as_posix(), max_age=max_age
            )
        abort(404)