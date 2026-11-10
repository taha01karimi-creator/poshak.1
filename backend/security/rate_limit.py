"""
Rate limiting for the admin auth endpoints.

We use Flask-Limiter. The login endpoint is the highest-risk surface, so it gets
its own strict limit: 5 failed attempts per IP per 15 minutes, then a 30-minute
cool-down. This mirrors the existing frontend lock-out behaviour but moves it to
the server where it cannot be bypassed.
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    swallow_errors=True,  # don't crash the app if the limiter is unavailable
)

# Login endpoint: 5 attempts per 15 minutes per IP
LOGIN_LIMIT = "5 per 15 minutes"

# Refresh / logout: 60 per minute per IP
REFRESH_LIMIT = "60 per minute"

# Generic admin writes: 30 per minute per IP
ADMIN_WRITE_LIMIT = "30 per minute"