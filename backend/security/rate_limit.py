import os

from flask import request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(

    key_func=get_remote_address,

    storage_uri=(
        os.environ.get("RATELIMIT_STORAGE_URI")
        or os.environ.get("REDIS_URL")
        or "memory://"
    ),
    default_limits=[],
    swallow_errors=True,
)

LOGIN_LIMIT = "5 per 15 minutes"

REFRESH_LIMIT = "60 per minute"

ORDER_LIMIT = "20 per hour"

TRACK_LIMIT = "30 per minute"

ADMIN_WRITE_LIMIT = "60 per minute"

def login_key() -> str:
    body = request.get_json(silent=True) or {}
    username = str(body.get("username") or "").strip().lower()[:80] or "-"
    return f"login:{get_remote_address()}:{username}"

def is_failed_response(response) -> bool:
    return response.status_code >= 400
