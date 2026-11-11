# Digistyle

فروشگاه اینترنتی مد و لباس — فرانت‌اند استاتیک + بک‌اند Flask (API و پنل مدیریت).

ویترین و پنل مدیریت هر دو از API می‌خوانند و می‌نویسند: محصولی که در پنل اضافه شود
برای همهٔ مشتری‌ها دیده می‌شود و سفارش مشتری روی سرور ذخیره می‌شود.

- `index.html` — صفحه اصلی
- `category.html?gender=men|women|kids` — صفحه هر دسته (۵ ردیف: کفش، لباس، شلوار، پاییز و زمستان، بهار و تابستان)
- `admin.html` — پنل مدیریت
- `css/style.css`, `css/admin.css` — استایل‌ها
- `js/utils.js` — ابزارها، `escapeHTML` و `apiRequest` (کوکی نشست + CSRF)
- `js/data.js` — دسته‌ها، کاتالوگ نمونه و `loadCatalog()` (خواندن محصولات و تنظیمات از API)
- `js/store.js` — سبد خرید و علاقه‌مندی‌ها (localStorage) + ثبت سفارش روی API
- `js/components.js` — هدر، کارت، سبد، مودال، جستجو
- `js/home.js`, `js/category.js` — منطق صفحه‌ها
- `js/admin.js`, `js/admin-config.js` — پنل مدیریت و فهرست دسترسی نقش‌ها
- `backend/` — Flask API

## اجرای محلی

اجرای کامل (فرانت هم روی همان سرور سرو می‌شود):

```bash
py -m venv .venv
.venv/Scripts/python -m pip install -r backend/requirements.txt   # لینوکس/مک: .venv/bin/python

cd backend
cp .env.example .env        # سپس SECRET_KEY و JWT_SECRET_KEY را پر کنید
../.venv/Scripts/python seed.py        # ساخت جدول‌ها + کاربران و محصولات اولیه
../.venv/Scripts/python run.py         # http://127.0.0.1:5000
```

سایت را از `http://127.0.0.1:5000` باز کنید (نه با کلیک روی فایل) تا API در دسترس باشد.
کلیدها از `backend/.env` خوانده می‌شوند؛ تولید مقدار:

```bash
python -c "import secrets; print('SECRET_KEY='+secrets.token_hex(48)); print('JWT_SECRET_KEY='+secrets.token_hex(48))"
```

رمز کاربران seed از `SEED_OWNER_PASSWORD` / `SEED_ADMIN_PASSWORD` گرفته می‌شود. در
اجرای محلی اگر خالی باشد یک رمز تصادفی ساخته و یک‌بار در ترمینال چاپ می‌شود؛ در
production (با `SEED_ON_BOOT=1`) تنظیم آن‌ها الزامی است.

## API

| مسیر | دسترسی | توضیح |
| --- | --- | --- |
| `GET /health` | عمومی | سلامت سرویس (محدودیت نرخ ندارد) |
| `GET /api/v1/products` | عمومی | کاتالوگ ویترین |
| `GET /api/v1/products/<id>` | عمومی | یک محصول |
| `GET /api/v1/settings` | عمومی | متن نوار بالا و قانون تخفیف سبد |
| `POST /api/v1/orders` | عمومی | ثبت سفارش مهمان (قیمت‌ها سمت سرور حساب می‌شود) |
| `GET /api/v1/csrf-token` | عمومی | صدور کوکی CSRF |
| `POST /api/v1/auth/login` | عمومی | ورود؛ ۵ تلاش ناموفق در ۱۵ دقیقه برای هر IP+نام کاربری |
| `POST /api/v1/auth/refresh` | کوکی refresh | چرخش refresh token (هر توکن یک‌بار) |
| `POST /api/v1/auth/logout` | access | ابطال refresh token و پاک کردن کوکی‌ها |
| `GET /api/v1/auth/me` | access | کاربر جاری |
| `POST/PUT/DELETE /api/v1/products` | `products.write` / `products.delete` | مدیریت محصولات |
| `GET /api/v1/orders` , `GET /api/v1/orders/<id>` | `orders.read` | سفارش‌ها |
| `PUT/DELETE /api/v1/orders/<id>` | `orders.write` / `orders.delete` | وضعیت و حذف سفارش |
| `PUT /api/v1/settings` | `settings.write` | ذخیرهٔ تنظیمات |
| `GET /api/v1/dashboard/stats` | `dashboard.read` | آمار داشبورد |
| `GET /api/v1/audit-logs` | `audit.read` | رویدادهای مدیریتی |

همهٔ `POST/PUT/DELETE`ها به هدر `X-CSRF-Token` (برابر مقدار کوکی `csrf_token`) نیاز دارند.

### دسترسی نقش‌ها

| دسترسی | owner | admin |
| --- | --- | --- |
| `products.read` / `write` | ✅ | ✅ |
| `products.delete` | ✅ | — |
| `orders.read` / `write` | ✅ | ✅ |
| `orders.delete` | ✅ | — |
| `settings.read` / `write` | ✅ | — |
| `dashboard.read` | ✅ | ✅ |
| `audit.read` | ✅ | — |

منبع حقیقت سمت سرور است: `backend/security/auth.py` (`PERMISSIONS_BY_ROLE`) و
فهرست سمت مرورگر فقط برای نمایش/پنهان‌کردن منو است.

## امنیت

- توکن‌ها هر دو HS256 هستند، اما فیلد `type` بررسی می‌شود: refresh token به‌عنوان
  access token پذیرفته نمی‌شود.
- محدودیت نرخ فقط روی مسیرهای حساس اعمال می‌شود (`/health` و فایل‌های استاتیک آزادند)
  و فقط پاسخ‌های ناموفق از سهمیه کم می‌کنند. فلاگ `REDIS_URL` شمارنده را بین ورکرها
  مشترک می‌کند؛ پیش‌فرض `memory://` است.
- پیام خطای ورود همیشه یکسان است و قفل حساب روی ترکیب IP+نام کاربری است، پس کسی
  نمی‌تواند حساب مالک را برای دیگران قفل کند.
- هدرهای امنیتی از یک منبع (`backend/security/headers.py`) می‌آیند؛ HSTS فقط در
  production و روی درخواست HTTPS ارسال می‌شود.
- تغییرات مدیریتی در جدول `audit_logs` ثبت می‌شوند (صفحهٔ «رویدادها» در پنل).
- ورودی‌ها با `&` و `'` و `"` پذیرفته می‌شوند؛ هنگام نمایش در فرانت `escapeHTML`
  اجرا می‌شود.

## استقرار روی GitHub و Render

### ۱) GitHub

```bash
git init -b main
git add .
git commit -m "Initial commit: digistyle storefront + Flask API"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

`.gitignore` آماده است و `.env`، دیتابیس‌های SQLite، `.venv`، `__pycache__` و کش‌ها را
نادیده می‌گیرد. **قبل از push یک‌بار `git status` بزنید.**

### ۲) Render (Blueprint)

1. Render Dashboard → **New → Blueprint** → ریپازیتوری را انتخاب کنید.
2. Render از `render.yaml` یک Web Service (`digistyle`) و یک Postgres (`digistyle-db`) می‌سازد.
3. رمز اولیهٔ `owner` و `admin` به‌صورت تصادفی توسط Render ساخته می‌شود (در Environment
   سرویس قابل مشاهده/تغییر است) و در لاگ چاپ نمی‌شود. اگر خودتان مقدار می‌دهید،
   `SEED_OWNER_PASSWORD` و `SEED_ADMIN_PASSWORD` را در Environment ست کنید.
4. Apply → بعد از build، آدرس `https://<name>.onrender.com` سایت را سرو می‌کند.

دستور اجرا:

```
gunicorn --chdir backend --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 60 wsgi:app
```

### استفاده از Postgres خارجی (Neon / Aiven / Supabase)

کد فقط به `DATABASE_URL` نیاز دارد و درایور `psycopg` خودکار انتخاب می‌شود، پس هر
Postgres مدیریت‌شده‌ای کار می‌کند. کافی است در Environment سرویس Render مقدار
`DATABASE_URL` را به رشتهٔ اتصال همان سرویس تغییر دهید و اولین بوت را با
`AUTO_CREATE_TABLES=1` و `SEED_ON_BOOT=1` (به‌همراه رمزهای seed) انجام دهید.

- رشتهٔ اتصال باید با `postgresql://` شروع شود؛ مقدار `?sslmode=require` را اگر
  سرویس می‌دهد حفظ کنید.
- `pool_pre_ping` و `pool_recycle` در `backend/config.py` فعال است تا بعد از خواب
  دیتابیس، اتصال‌های مرده دوباره استفاده نشوند.
- پلن رایگان Neon: ۱ گیگابایت برای هر پروژه، ۱۰۰ CU-hour در ماه، مجانی و بدون
  انقضا؛ بعد از ۵ دقیقه بی‌کاری compute صفر می‌شود. برای اپ‌های با اتصال زیاد،
  هاست `-pooler` را از پنل بردارید.
- پلن رایگان Aiven: ۱ گیگابایت دیسک، ۱ گیگ رم، یک نود، بدون کارت اعتباری و
  بدون انقضا، ولی `max_connections` برابر ۲۰ است، connection pooling ندارد و
  سرویس بی‌استفاده خاموش می‌شود (پلن Developer با ۵ دلار در ماه همیشه روشن است).

### محدودیت‌های پلن رایگان Render

- سرویس رایگان بعد از ۱۵ دقیقه بی‌ترافیک می‌خوابد و درخواست بعدی حدود یک دقیقه طول می‌کشد.
- **Postgres رایگان Render ۳۰ روز بعد از ساخت منقضی می‌شود.** چون پروژه فقط
  `DATABASE_URL` می‌خواهد، رشتهٔ اتصال Neon یا Supabase را در Environment همان متغیر
  بگذارید تا مشکل حل شود (driver `psycopg` خودکار انتخاب می‌شود).
- فایل‌سیستم سرویس موقتی است؛ SQLite برای production مناسب نیست.
- شمارندهٔ rate limit روی `memory://` است؛ برای چند ورکر `REDIS_URL` را از Render
  Key Value بدهید.
