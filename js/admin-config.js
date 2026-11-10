/*
  تنظیمات پنل مدیریت
  ورود به پنل روی سرور انجام می‌شود (POST /api/v1/auth/login) و هیچ رمزی در
  فایل‌های سمت مرورگر نگه‌داری نمی‌شود. حساب‌ها در جدول users دیتابیس هستند و
  در اولین بوت با SEED_OWNER_USERNAME / SEED_ADMIN_USERNAME ساخته می‌شوند.
*/

const ADMIN_API_BASE = "/api/v1";

// دسترسی‌ها: مالک همه‌چیز، ادمین فقط افزودن/ویرایش محصول و مدیریت وضعیت سفارش
const ROLE_PERMISSIONS = {
  owner: [
    "products.write",
    "products.delete",
    "orders.write",
    "orders.delete",
    "settings",
  ],
  admin: ["products.write", "orders.write"],
};
