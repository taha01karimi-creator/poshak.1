"""هدرهای امنیتی پاسخ‌ها — تنها منبع حقیقت (app.py فقط این را صدا می‌زند)."""

# CSP: اسکریپت فقط same-origin، استایل inline مجاز (صفحه‌ها از style attribute
# استفاده می‌کنند) و فونت از Google Fonts.
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "img-src 'self' data:; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self'; "
        "base-uri 'self'; "
        "form-action 'self'; "
        "frame-ancestors 'none';"
    ),
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}

HSTS_HEADER = ("Strict-Transport-Security", "max-age=31536000; includeSubDomains")


def apply_security_headers(response, *, hsts: bool = False):
    """Apply the shared header set; HSTS only over HTTPS at runtime."""
    for key, value in SECURITY_HEADERS.items():
        response.headers.setdefault(key, value)
    if hsts:
        response.headers.setdefault(*HSTS_HEADER)
    return response
