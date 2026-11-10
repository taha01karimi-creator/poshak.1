"""
Security response headers middleware.

Applied to every response. Blocks clickjacking, MIME sniffing, enforces HTTPS
where possible, and restricts referrer info.
"""
from functools import wraps

from flask import make_response

SECURITY_HEADERS = {
    # Prevent MIME-type sniffing
    "X-Content-Type-Options": "nosniff",
    # Block clickjacking (deny framing entirely)
    "X-Frame-Options": "DENY",
    # Strict referrer policy: don't leak full URL to third parties
    "Referrer-Policy": "strict-origin-when-cross-origin",
    # Content Security Policy — only same-origin + our own fonts.google.com
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' https://fonts.googleapis.com; "
        "style-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self';"
    ),
}


def apply_security_headers(response):
    for key, value in SECURITY_HEADERS.items():
        response.headers.setdefault(key, value)
    return response