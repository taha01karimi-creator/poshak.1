# کدلاین | Codelaine

فروشگاه اینترنتی مد و لباس — نمونه‌کار کدلاین؛ فرانت‌اند استاتیک + بک‌اند Flask (API و پنل مدیریت).

ویترین و پنل مدیریت هر دو از API می‌خوانند و می‌نویسند: محصولی که در پنل اضافه شود
برای همهٔ مشتری‌ها دیده می‌شود و سفارش مشتری روی سرور ذخیره می‌شود.

- 🔗 **مخزن گیت‌هاب:** <https://github.com/taha01karimi-creator/poshak.1>
- 🌐 **صفحهٔ نمونه‌کارها:** <https://taha01karimi-creator.github.io/poshak.1/>
- 🛍 **فروشگاه آنلاین:** <https://taha01karimi-creator.github.io/poshak.1/frontend/index.html>
- 🛠 **پنل مدیریت:** <https://taha01karimi-creator.github.io/poshak.1/frontend/admin.html>

## صفحه‌ها

| مسیر | توضیح |
| --- | --- |
| `frontend/index.html` | صفحهٔ اصلی، اسلایدر و ردیف‌های محصول |
| `frontend/category.html?gender=…` | دسته‌بندی زنانه، مردانه و بچگانه |
| `frontend/product.html?id=…` | صفحهٔ محصول با سایز، مشخصات و محصولات مرتبط |
| `frontend/about.html` | دربارهٔ نمونه‌کار، استک و محدودیت‌ها |
| `frontend/help.html` | راهنمای سایز، ارسال، بازگشت کالا و حریم خصوصی |
| `frontend/404.html` | صفحهٔ خطای اختصاصی |
| `frontend/admin.html` | پنل مدیریت (با API واقعی یا حالت نمایشی مرورگر) |

> روی GitHub Pages بک‌اند Flask اجرا نمی‌شود؛ پنل مدیریت و سفارش‌ها در حالت نمایشی
> و فقط در همان مرورگر کار می‌کنند. درگاه پرداخت واقعی وجود ندارد.

## اجرای سریع نمایشی

```bash
cd frontend
python -m http.server 8080
# http://127.0.0.1:8080/index.html
```
