"""Authentication utilities: bcrypt password hashing + JWT access/refresh tokens."""

from datetime import datetime, timedelta, timezone
from functools import wraps
import secrets

import jwt
from flask import current_app, g, request

from app import bcrypt


# ---------------------------------------------------------------------------
# Password hashing (bcrypt via flask-bcrypt)
# ---------------------------------------------------------------------------
# bcrypt only reads the first 72 bytes of a password. Cutting the encoded value
# keeps the behaviour explicit instead of letting the library raise or truncate.
_BCRYPT_MAX_BYTES = 72


def _bounded(plain: str) -> str:
    """Trim a password to bcrypt's 72-byte limit without splitting a character."""
    return plain.encode("utf-8")[:_BCRYPT_MAX_BYTES].decode("utf-8", "ignore")


def hash_password(plain: str) -> str:
    """Hash a plain-text password with bcrypt."""
    return bcrypt.generate_password_hash(_bounded(plain)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time verification of a password against its bcrypt hash."""
    if not isinstance(plain, str) or not isinstance(hashed, str) or not hashed:
        return False
    try:
        return bcrypt.check_password_hash(hashed, _bounded(plain))
    except (ValueError, TypeError):
        return False


# ---------------------------------------------------------------------------
# JWT access / refresh tokens
# ---------------------------------------------------------------------------
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def generate_access_token(user_id: int, role: str, username: str, title: str) -> str:
    """Create a short-lived JWT access token (configurable lifetime)."""
    now = _now()
    payload = {
        "sub": str(user_id),
        "role": role,
        "username": username,
        "title": title,
        "type": ACCESS_TOKEN_TYPE,
        "iat": now,
        "exp": now + timedelta(seconds=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]),
    }
    return jwt.encode(
        payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256"
    )


def generate_refresh_token(user_id: int) -> tuple[str, str, datetime]:
    """Create a long-lived refresh token.

    Returns ``(token, jti, expires_at)``. The jti lets the caller persist a
    revocable row in the refresh_tokens table.
    """
    now = _now()
    expires_at = now + timedelta(seconds=current_app.config["JWT_REFRESH_TOKEN_EXPIRES"])
    jti = secrets.token_hex(16)
    payload = {
        "sub": str(user_id),
        "type": REFRESH_TOKEN_TYPE,
        "jti": jti,
        "iat": now,
        "exp": expires_at,
    }
    token = jwt.encode(
        payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256"
    )
    return token, jti, expires_at


def _decode(token: str, expected_type: str) -> dict | None:
    """Decode a JWT and reject tokens of the wrong type.

    A refresh token must never be usable as an access token (and vice versa),
    so the ``type`` claim is part of the check — not just the signature.
    """
    try:
        payload = jwt.decode(
            token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
        )
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
    if not isinstance(payload, dict) or payload.get("type") != expected_type:
        return None
    return payload


def decode_access_token(token: str) -> dict | None:
    """Decode & validate a JWT access token. Returns payload dict or None."""
    return _decode(token, ACCESS_TOKEN_TYPE)


def decode_refresh_token(token: str) -> dict | None:
    """Decode a refresh token (DB-side validation happens at the call site)."""
    return _decode(token, REFRESH_TOKEN_TYPE)


# ---------------------------------------------------------------------------
# Middleware: decode the access token and attach payload to flask.g
# ---------------------------------------------------------------------------
def _bearer_token() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip() or None
    return request.cookies.get("access_token")


def jwt_required_middleware(fn):
    """View decorator that enforces a valid access token.

    The token is read from the Authorization header (Bearer) or the
    `access_token` cookie. On success the decoded payload is attached to
    `flask.g.user`. On failure the view receives a 401.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _bearer_token()
        if not token:
            return {"error": "Authentication required"}, 401

        payload = decode_access_token(token)
        if not payload:
            return {"error": "Invalid or expired token"}, 401

        g.user = payload
        return fn(*args, **kwargs)

    return wrapper


# ---------------------------------------------------------------------------
# Permission helpers
# ---------------------------------------------------------------------------
PERMISSIONS_BY_ROLE = {
    "owner": {
        "products.read",
        "products.write",
        "products.delete",
        "orders.read",
        "orders.write",
        "orders.delete",
        "settings.read",
        "settings.write",
        "dashboard.read",
        "audit.read",
    },
    "admin": {
        "products.read",
        "products.write",
        "orders.read",
        "orders.write",
        "dashboard.read",
    },
    "customer": set(),
}


def has_permission(role: str, permission: str) -> bool:
    """Server-side source of truth for role-based access."""
    return permission in PERMISSIONS_BY_ROLE.get(role, set())


def require_permission(*required: str):
    """Decorator: request must carry a valid access token holding at least one permission."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            payload = getattr(g, "user", None)
            if not payload:
                return {"error": "Authentication required"}, 401

            role = payload.get("role")
            if not role:
                return {"error": "Token missing role claim"}, 401

            if not any(has_permission(role, p) for p in required):
                return {"error": "Insufficient permissions"}, 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator
