"""محدودیت نرخ درخواست — فقط روی نقاط حساس، نه کل سایت.

نکات مهم:
- هیچ limit سراسری‌ای تعریف نشده (`default_limits=[]`)، پس `/health`، فایل‌های
  استاتیک و صفحات فرانت محدود نمی‌شوند و health check رندر هم رد نمی‌شود.
- محدودیت ورود به‌ازای ترکیب «IP + نام کاربری» شمرده می‌شود تا یک مهاجم نتواند
  با چند رمز غلط، حساب owner را برای بقیه قفل کند.
- فقط پاسخ‌های ناموفق از سهمیه کم می‌کنند (`deduct_when`)، پس ورود موفق و
  درخواست‌های سالم چیزی مصرف نمی‌کنند.
"""
import os

from flask import request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.environ.get("REDIS_URL") or "memory://",
    default_limits=[],
    swallow_errors=True,  # اگر storage در دسترس نبود، اپ نباید بخوابد
)

# ورود: ۵ تلاش ناموفق در ۱۵ دقیقه برای هر IP + نام کاربری
LOGIN_LIMIT = "5 per 15 minutes"

# تازه‌سازی/خروج: ۶۰ در دقیقه
REFRESH_LIMIT = "60 per minute"

# ثبت سفارش مهمان: ۲۰ سفارش در ساعت برای هر IP
ORDER_LIMIT = "20 per hour"

# تغییرات مدیریتی: ۶۰ در دقیقه
ADMIN_WRITE_LIMIT = "60 per minute"


def login_key() -> str:
    """کلید محدودیت ورود: IP + نام کاربری (حساب دیگران قفل نمی‌شود)."""
    body = request.get_json(silent=True) or {}
    username = str(body.get("username") or "").strip().lower()[:80] or "-"
    return f"login:{get_remote_address()}:{username}"


def is_failed_response(response) -> bool:
    """فقط پاسخ‌های خطا از سهمیه کم می‌کنند."""
    return response.status_code >= 400
