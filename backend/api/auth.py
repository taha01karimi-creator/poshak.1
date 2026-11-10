"""Authentication endpoints: login, refresh, logout, me and the CSRF token.

Tokens are issued as HS256 JWTs by ``security.auth``. The access token is
short-lived; the refresh token is also stored in the ``refresh_tokens`` table so
it can be revoked. Both are returned in the JSON body (for API clients using the
``Authorization: Bearer`` flow) and set as HttpOnly cookies (for the browser).
"""

import hashlib
from datetime import datetime, timedelta, timezone

from flask import Blueprint, current_app, g, jsonify, make_response, request

from app import db
from models import RefreshToken, User
from security.auth import (
    decode_refresh_token,
    generate_access_token,
    generate_refresh_token,
    jwt_required_middleware,
    verify_password,
)
from security.csrf import attach_csrf_cookie, issue_csrf_token, require_csrf
from security.rate_limit import LOGIN_LIMIT, REFRESH_LIMIT, limiter

bp = Blueprint("auth", __name__)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _utcnow() -> datetime:
    """Naive UTC timestamp — matches what SQLite hands back on read."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "title": user.title,
    }


def _set_cookie(response, name: str, value: str, max_age: int):
    response.set_cookie(
        name,
        value,
        max_age=max_age,
        httponly=True,
        secure=bool(current_app.config.get("COOKIE_SECURE")),
        samesite="Lax",
        path="/",
    )
    return response


def _session_response(user: User, status: int = 200):
    """Build a JSON response carrying a fresh token pair + matching cookies."""
    access = generate_access_token(user.id, user.role, user.username, user.title)
    refresh, jti, expires_at = generate_refresh_token(user.id)

    db.session.add(
        RefreshToken(
            user_id=user.id,
            jti=jti,
            token_hash=_hash_token(refresh),
            expires_at=expires_at.replace(tzinfo=None),
        )
    )
    db.session.commit()

    access_max_age = int(current_app.config["JWT_ACCESS_TOKEN_EXPIRES"])
    refresh_max_age = int(current_app.config["JWT_REFRESH_TOKEN_EXPIRES"])

    payload = {
        "ok": True,
        "user": _user_dict(user),
        "access_token": access,
        "refresh_token": refresh,
        "expires_in": access_max_age,
    }
    response = make_response(jsonify(payload), status)
    _set_cookie(response, ACCESS_COOKIE, access, access_max_age)
    _set_cookie(response, REFRESH_COOKIE, refresh, refresh_max_age)
    attach_csrf_cookie(response, issue_csrf_token())
    return response


def _clear_session_cookies(response):
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(
            name,
            path="/",
            secure=bool(current_app.config.get("COOKIE_SECURE")),
            samesite="Lax",
        )
    return response


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@bp.get("/v1/csrf-token")
def csrf_token():
    """Issue the double-submit CSRF cookie the SPA echoes in X-CSRF-Token."""
    token = issue_csrf_token()
    response = make_response({"ok": True, "csrfToken": token})
    return attach_csrf_cookie(response, token)


@bp.post("/v1/auth/login")
@limiter.limit(LOGIN_LIMIT)
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not isinstance(password, str) or not password:
        return {"ok": False, "error": "نام کاربری و رمز عبور الزامی است"}, 400

    user = User.query.filter_by(username=username).first()
    now = _utcnow()

    if user and user.locked_until and user.locked_until > now:
        retry = int((user.locked_until - now).total_seconds())
        return (
            {"ok": False, "error": "حساب موقتاً قفل شده است", "retry_after": retry},
            429,
        )

    valid = bool(user) and user.is_active and verify_password(password, user.password_hash)

    if not valid:
        if user:
            user.failed_attempts = (user.failed_attempts or 0) + 1
            if user.failed_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
                user.failed_attempts = 0
            db.session.commit()
        return {"ok": False, "error": "نام کاربری یا رمز عبور اشتباه است"}, 401

    user.failed_attempts = 0
    user.locked_until = None
    return _session_response(user)


@bp.post("/v1/auth/refresh")
@limiter.limit(REFRESH_LIMIT)
@require_csrf
def refresh():
    """Rotate a valid refresh token into a new access/refresh pair."""
    body = request.get_json(silent=True) or {}
    token = body.get("refresh_token") or request.cookies.get(REFRESH_COOKIE)
    if not token:
        return {"ok": False, "error": "Refresh token missing"}, 401

    decoded = decode_refresh_token(token)
    if not decoded or decoded.get("type") != "refresh":
        return {"ok": False, "error": "Invalid refresh token"}, 401

    row = RefreshToken.query.filter_by(jti=decoded.get("jti")).first()
    expired = bool(row) and row.expires_at < _utcnow()
    if not row or row.token_hash != _hash_token(token) or expired:
        if row:  # replay or stale row: drop it so it cannot be reused
            db.session.delete(row)
            db.session.commit()
        return {"ok": False, "error": "Refresh token is expired or revoked"}, 401

    user = db.session.get(User, row.user_id)
    if not user or not user.is_active:
        db.session.delete(row)
        db.session.commit()
        return {"ok": False, "error": "Account is not active"}, 401

    db.session.delete(row)  # single-use: rotate
    return _session_response(user)


@bp.post("/v1/auth/logout")
@jwt_required_middleware
@require_csrf
def logout():
    """Revoke the caller's refresh token(s) and clear the auth cookies."""
    body = request.get_json(silent=True) or {}
    token = body.get("refresh_token") or request.cookies.get(REFRESH_COOKIE)
    user_id = int(g.user["sub"])

    query = RefreshToken.query.filter_by(user_id=user_id)
    if token:
        decoded = decode_refresh_token(token)
        if decoded and decoded.get("jti"):
            query = query.filter_by(jti=decoded["jti"])

    query.delete()
    db.session.commit()

    return _clear_session_cookies(make_response(jsonify({"ok": True})))


@bp.get("/v1/auth/me")
@jwt_required_middleware
def me():
    user = db.session.get(User, int(g.user["sub"]))
    if not user or not user.is_active:
        return {"ok": False, "error": "Account is not active"}, 401
    return {"ok": True, "user": _user_dict(user)}
