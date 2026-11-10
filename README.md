# Digistyle

فروشگاه اینترنتی مد و لباس — فرانت‌اند استاتیک + بک‌اند Flask (API و پنل مدیریت).

- index.html — صفحه اصلی
- category.html?gender=men|women|kids — صفحه هر دسته (۵ ردیف: کفش، لباس، شلوار، پاییز و زمستان، بهار و تابستان)
- admin.html — پنل مدیریت
- css/style.css — استایل‌ها
- js/utils.js — ابزارهای کوچک
- js/data.js — برندها و محصولات
- js/store.js — سبد خرید، علاقه‌مندی‌ها، کاربر (localStorage)
- js/components.js — هدر، کارت، سبد، مودال، جستجو
- js/home.js و js/category.js — منطق هر صفحه
- backend/ — Flask API

## اجرای محلی

ساده‌ترین راه برای دیدن فرانت: افزونه Live Server روی `index.html` (راست‌کلیک → Open with Live Server).

اجرای کامل با بک‌اند (فرانت هم روی همان سرور سرو می‌شود):

```bash
py -m venv .venv
.venv/Scripts/python -m pip install -r backend/requirements.txt   # لینوکس/مک: .venv/bin/python

cd backend
cp .env.example .env        # سپس SECRET_KEY و JWT_SECRET_KEY را پر کنید
../.venv/Scripts/python seed.py        # ساخت جدول‌ها + کاربران و محصولات اولیه
../.venv/Scripts/python run.py         # http://127.0.0.1:5000
```

- کلیدها از `backend/.env` خوانده می‌شوند. تولید مقادیر:
  `python -c "import secrets; print('SECRET_KEY='+secrets.token_hex(48)); print('JWT_SECRET_KEY='+secrets.token_hex(48))"`
- رمز کاربران seed از `SEED_OWNER_PASSWORD` / `SEED_ADMIN_PASSWORD` گرفته می‌شود؛ اگر تنظیم نشده باشد یک رمز تصادفی ساخته و یک‌بار در ترمینال چاپ می‌شود. هیچ رمزی در سورس نیست.

## پنل مدیریت

- آدرس: `admin.html` (باید از همان دامنهٔ سرور باز شود، نه با کلیک روی فایل).
- ورود با `POST /api/v1/auth/login` روی سرور بررسی می‌شود؛ هیچ رمزی در فایل‌های JS سمت مرورگر نیست.
- حساب‌ها همان‌هایی هستند که `seed.py` می‌سازد (جدول `users`)؛ نام کاربری از `SEED_OWNER_USERNAME` / `SEED_ADMIN_USERNAME` و رمز از `SEED_OWNER_PASSWORD` / `SEED_ADMIN_PASSWORD` گرفته می‌شود.
- نقش `owner` همهٔ دسترسی‌ها را دارد و نقش `admin` فقط محصولات و وضعیت سفارش‌ها را تغییر می‌دهد.
- داده‌های محصولات/سفارش‌های پنل فعلاً در localStorage مرورگر می‌مانند.

## API

- `GET /health` — سلامت سرویس
- `GET /api/v1/csrf-token` — صدور کوکی CSRF (برای POST/PUT/DELETE لازم است و باید در هدر `X-CSRF-Token` تکرار شود)
- `POST /api/v1/auth/login` — `{username, password}` → توکن‌های access/refresh
- `POST /api/v1/auth/refresh` — چرخش refresh token (هر توکن یک‌بار)
- `POST /api/v1/auth/logout` — ابطال refresh token و پاک کردن کوکی‌ها
- `GET /api/v1/auth/me` — کاربر جاری
- `GET|POST|PUT|DELETE /api/v1/products` و `/api/v1/orders` و `/api/v1/settings` و `GET /api/v1/dashboard/stats` — نیازمند توکن؛ دسترسی‌ها در `backend/security/auth.py` (`PERMISSIONS_BY_ROLE`).

هشدار: فرانت‌اند فعلی هنوز به این API وصل نیست و با localStorage کار می‌کند.

## استقرار روی GitHub و Render

### ۱) GitHub

```bash
git init -b main
git add .
git commit -m "Initial commit: digistyle storefront + Flask API"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

`.gitignore` آماده است و `.env`، دیتابیس‌های SQLite، `.venv` و کش‌ها را نادیده می‌گیرد. **قبل از push یک‌بار `git status` بزنید** تا مطمئن شوید `backend/.env` یا `backend/digistyle.db` وارد نشده‌اند.

### ۲) Render (Blueprint)

فایل `render.yaml` در ریشهٔ پروژه آماده است:

1. Render Dashboard → **New → Blueprint** → ریپازیتوری GitHub را انتخاب کنید.
2. Render فایل `render.yaml` را می‌خواند و یک Web Service (`digistyle`) به‌همراه یک Render Postgres (`digistyle-db`) می‌سازد.
3. اگر خواستید رمز اولیهٔ مالک/ادمین را خودتان تعیین کنید، در مرحلهٔ ساخت برای `SEED_OWNER_PASSWORD` و `SEED_ADMIN_PASSWORD` مقدار بدهید. اگر خالی بگذارید، رمز تصادفی ساخته و **یک‌بار در لاگ دیپلوی** چاپ می‌شود.
4. Apply → صبر کنید تا build و deploy تمام شود. آدرس `https://<name>.onrender.com` سایت را از همان سرویس سرو می‌کند و API زیر `/api` است.

دستور اجرا در Render:

```
gunicorn --chdir backend --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 60 wsgi:app
```

### چه چیزهایی خودکار تنظیم شده‌اند

| تنظیم | مقدار | توضیح |
| --- | --- | --- |
| `SECRET_KEY` / `JWT_SECRET_KEY` | ساخته‌شده توسط Render | هرگز داخل ریپو نیستند |
| `FLASK_ENV` | `production` | اجرای `wsgi.py` با کانفیگ پروداکشن |
| `COOKIE_SECURE` | `1` | کوکی‌ها فقط روی HTTPS |
| `AUTO_CREATE_TABLES` | `1` | ساخت جدول‌ها در اولین بوت (بعداً با migration جایگزین کنید) |
| `SEED_ON_BOOT` | `1` | پر کردن دیتابیس خالی با کاربران و محصولات اولیه |
| `DATABASE_URL` | از سرویس Postgres | `postgresql://` به‌صورت خودکار به درایور `psycopg` نگاشت می‌شود |

### محدودیت‌های پلن رایگان Render

- سرویس رایگان بعد از ۱۵ دقیقه بی‌ترافیک می‌خوابد و درخواست بعدی حدود یک دقیقه طول می‌کشد تا بیدار شود.
- دیتابیس رایگان Render ۳۰ روز بعد از ساخت منقضی می‌شود (۱ گیگ، فقط یکی در هر workspace)؛ بعد از آن ۱۴ روز فرصت ارتقا دارید وگرنه داده‌ها پاک می‌شوند.
- فایل‌سیستم سرویس موقتی است؛ بنابراین SQLite برای production مناسب نیست و باید از Postgres استفاده کرد. داده‌های موجود در `backend/digistyle.db` محلی است و به Render منتقل نمی‌شود.
- شمارندهٔ rate limit روی `memory://` است؛ اگر چند نمونه/ورکر دارید، `REDIS_URL` را از Render Key Value بدهید.
