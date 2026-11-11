/*
  تنظیمات پنل مدیریت
  ورود به پنل روی سرور انجام می‌شود (POST /api/v1/auth/login) و هیچ رمزی در
  فایل‌های سمت مرورگر نگه‌داری نمی‌شود. حساب‌ها در جدول users دیتابیس هستند.
  نام‌های دسترسی باید با PERMISSIONS_BY_ROLE در backend/security/auth.py یکی باشند.
*/

const ADMIN_API_BASE = "/api/v1";

const ROLE_PERMISSIONS = {
  owner: [
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
  ],
  admin: [
    "products.read",
    "products.write",
    "orders.read",
    "orders.write",
    "dashboard.read",
  ],
};
