"""
Configuration for the Digistyle backend.

Security notes:
- All secrets MUST come from environment variables. There is no fallback secret
  in source code so that a leaked repo never exposes a live key.
- SECRET_KEY / JWT_SECRET_KEY are required at runtime: `validate()` is called by
  the application factory, so importing this module (tests, CLI) does not raise.
- Bcrypt cost factor is pinned to a known-good value.
"""
import os
import secrets
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
BASE_DIR = BACKEND_DIR.parent

# Everything that must never reach the repository (the real .env, the local
# SQLite database, the virtualenv) lives in <repo>/private/, which .gitignore
# excludes. Moved it elsewhere? Point DIGISTYLE_PRIVATE_DIR at the new path.
PRIVATE_DIR = Path(
    os.environ.get("DIGISTYLE_PRIVATE_DIR") or (BASE_DIR / "private")
).resolve()

try:  # python-dotenv is optional at runtime; keep import failures harmless
    from dotenv import load_dotenv

    # Real environment variables always win; .env only fills in the gaps.
    # private/.env is the real one; backend/.env still works for the old layout.
    for _env_file in (PRIVATE_DIR / ".env", BACKEND_DIR / ".env"):
        load_dotenv(_env_file)
except ImportError:  # pragma: no cover
    pass


def _normalize_db_url(url: str) -> str:
    """Map managed-database URLs onto the driver actually installed.

    Render (and Heroku) hand out ``postgres://`` or ``postgresql://``; SQLAlchemy
    needs an explicit driver, and we ship psycopg 3.
    """
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    scheme, sep, rest = url.partition("://")
    if sep and scheme == "postgresql":
        url = "postgresql+psycopg://" + rest
    return url


class Config:
    """Base configuration shared by all environments."""

    # --- Core secrets (REQUIRED, validated by validate()) ---
    SECRET_KEY = os.environ.get("SECRET_KEY")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

    # --- Database ---
    # SQLite by default for dev; override with DATABASE_URL for Postgres/MySQL.
    DATABASE_URL = _normalize_db_url(
        os.environ.get(
            "DATABASE_URL",
            f"sqlite:///{PRIVATE_DIR / 'digistyle.db'}",
        )
    )
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Managed Postgres (Neon, Aiven, Supabase, Render) suspends idle services and
    # drops connections. Pre-ping + recycle stop the pool from handing out a dead
    # socket after the database wakes up.
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }
    # Dev convenience: create missing tables on boot. Production should migrate.
    AUTO_CREATE_TABLES = os.environ.get("AUTO_CREATE_TABLES", "1") == "1"
    # Seed users/products when the database is empty (first Render boot).
    SEED_ON_BOOT = os.environ.get("SEED_ON_BOOT", "0") == "1"

    # --- JWT ---
    # Access token lifetime (seconds). Short-lived tokens limit exposure.
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 900))  # 15 min
    JWT_REFRESH_TOKEN_EXPIRES = int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES", 604800))  # 7 days

    # --- Cookies ---
    # Send auth cookies with the Secure flag. Must be on in production (HTTPS).
    COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "0") == "1"

    # --- Security hardening ---
    # Password hashing cost factor (bcrypt work factor). 12 is a good balance.
    BCRYPT_LOG_ROUNDS = int(os.environ.get("BCRYPT_LOG_ROUNDS", 12))

    # --- CORS ---
    # Explicit allow-list of front-end origins. Never use "*" with credentials.
    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:8000,http://127.0.0.1:8000,http://localhost:5500",
    )

    # --- Hardening flags ---
    # HSTS only makes sense behind HTTPS; enabled in production below.
    HSTS_ENABLED = False
    # In production the seed accounts must get explicit passwords.
    REQUIRE_SEED_PASSWORDS = False

    # --- Rate limiting ---
    # Default limits per IP. Set REDIS_URL to share counters across processes.
    RATELIMIT_STORAGE_URI = os.environ.get("REDIS_URL", "memory://")

    # --- Admin / admin-panel access ---
    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")

    # --- App metadata ---
    APP_NAME = "digistyle"
    APP_VERSION = "2.0.0"

    @classmethod
    def validate(cls) -> None:
        """Raise if required secrets are missing. Called by create_app()."""
        missing = [
            name
            for name in ("SECRET_KEY", "JWT_SECRET_KEY")
            if not getattr(cls, name, None)
        ]
        if missing:
            raise RuntimeError(
                "Missing required environment variables: "
                + ", ".join(missing)
                + ". Add them to private/.env. Generate values with: "
                "python -c \"import secrets; print(secrets.token_hex(48))\""
            )


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    COOKIE_SECURE = True
    HSTS_ENABLED = True
    REQUIRE_SEED_PASSWORDS = True
    # A fresh managed database has no tables; an explicit env flag lets the
    # first boot create them. Set AUTO_CREATE_TABLES=0 once migrations exist.
    AUTO_CREATE_TABLES = os.environ.get("AUTO_CREATE_TABLES", "0") == "1"

    @classmethod
    def validate(cls) -> None:
        super().validate()
        if not os.environ.get("DATABASE_URL"):
            raise RuntimeError("DATABASE_URL must be set in production")
        # A random password printed into the deploy log is a leak: require the
        # operator to choose the seed passwords explicitly.
        if os.environ.get("SEED_ON_BOOT") == "1":
            missing = [
                name
                for name in ("SEED_OWNER_PASSWORD", "SEED_ADMIN_PASSWORD")
                if not os.environ.get(name)
            ]
            if missing:
                raise RuntimeError(
                    "SEED_ON_BOOT=1 requires "
                    + ", ".join(missing)
                    + " so no random password is printed to the deploy logs."
                )


class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    # Tests never need real secrets; generate throwaway ones per process.
    SECRET_KEY = secrets.token_hex(32)
    JWT_SECRET_KEY = secrets.token_hex(32)
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    RATELIMIT_ENABLED = False
    AUTO_CREATE_TABLES = True


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
