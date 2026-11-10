"""
Double-submit CSRF protection for state-changing endpoints.

Flow:
1. Client fetches GET /api/v1/csrf-token -> server sets `X-CSRF-Token` cookie (HttpOnly=False so JS can read).
2. Client sends the cookie value back as `X-CSRF-Token` header on every POST/PUT/DELETE.
3. Server compares header vs cookie; mismatch -> 403.

Because the cookie is not HttpOnly, the SPA can read it via document.cookie.
The cookie is SameSite=Lax + Secure in production; HttpOnly=False so the SPA can read it.
"""
import os
from functools import wraps

from flask import current_app, request

CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"


def issue_csrf_token() -> str:
    token = os.urandom(16).hex()
    return token


def validate_csrf() -> str | None:
    """Return an error message if CSRF check fails; None if OK."""
    header = request.headers.get(CSRF_HEADER_NAME)
    cookie = request.cookies.get(CSRF_COOKIE_NAME)
    if not header or not cookie or header != cookie:
        return "CSRF token mismatch"
    return None


def require_csrf(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        error = validate_csrf()
        if error:
            return {"error": error}, 403
        return fn(*args, **kwargs)

    return wrapper


def attach_csrf_cookie(response, token: str):
    """Set the csrf_token cookie on a response. Call after issuing a token."""
    secure = bool(current_app.config.get("COOKIE_SECURE"))
    response.set_cookie(
        CSRF_COOKIE_NAME,
        token,
        httponly=False,          # SPA needs to read it
        secure=secure,
        samesite="Lax",
        path="/",
        max_age=3600,
    )
    return response