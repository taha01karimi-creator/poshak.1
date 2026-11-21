# کدلاین | Codelaine

فروشگاه اینترنتی مد و لباس — نمونه‌کار کدلاین؛ فرانت‌اند استاتیک + بک‌اند Flask (API و پنل مدیریت).

ویترین و پنل مدیریت هر دو از API می‌خوانند و می‌نویسند: محصولی که در پنل اضافه شود
برای همهٔ مشتری‌ها دیده می‌شود و سفارش مشتری روی سرور ذخیره می‌شود.

- 🔗 **مخزن گیت‌هاب:** <https://github.com/taha01karimi-creator/poshak.1>
- 🌐 **نسخهٔ آنلاین (GitHub Pages):** <https://taha01karimi-creator.github.io/poshak.1/>
- 🛠 **پنل مدیریت:** <https://taha01karimi-creator.github.io/poshak.1/admin.html> — خصوصی، دسترسی به هیچ‌کس داده نمی‌شود

## ساختار پروژه

```text
frontend/          ← فرانت‌اند (همین پوشه روی GitHub Pages منتشر می‌شود)
  index.html
  category.html
  admin.html
  css/             style.css ، admin.css
  js/              utils / data / store / components / home / category / admin
  images/          hero ، gender ، categories ، brands ، products
backend/           ← بک‌اند Flask (API ، احراز هویت ، دیتابیس)
.github/workflows/ ← انتشار خودکار فقط پوشهٔ frontend روی Pages
render.yaml        ← تنظیم سرویس بک‌اند روی Render
```

اگر روی سرور Flask اجرا شود، همان بک‌اند پوشهٔ `frontend/` را هم سرو می‌کند؛
پس آدرس صفحه‌ها (`/`، `/category.html`، `/admin.html`) تغییری نمی‌کند.

- `frontend/index.html` — صفحه اصلی
- `frontend/category.html?gender=men|women|kids` — صفحه هر دسته (۵ ردیف: کفش، لباس، شلوار، پاییز و زمستان، بهار و تابستان)
- `frontend/admin.html` — پنل مدیریت
- `frontend/css/style.css`, `frontend/css/admin.css` — استایل‌ها
- `frontend/js/utils.js` — ابزارها، `escapeHTML` و `apiRequest` (کوکی نشست + CSRF)
- `frontend/js/data.js` — دسته‌ها، کاتالوگ نمونه و `loadCatalog()` (خواندن محصولات و تنظیمات از API)
- `frontend/js/store.js` — سبد خرید و علاقه‌مندی‌ها (localStorage) + ثبت سفارش روی API
- `frontend/js/components.js` — هدر، کارت، سبد، مودال، جستجو
- `frontend/js/home.js`, `frontend/js/category.js` — منطق صفحه‌ها
- `frontend/js/admin.js`, `frontend/js/admin-config.js` — پنل مدیریت و فهرست دسترسی نقش‌ها

## نسخهٔ موبایل

فروشگاه و پنل مدیریت کاملاً ریسپانسیو هستند (تست‌شده روی عرض ۳۷۵ پیکسل، بدون اسکرول افقی):

- **فروشگاه**: هدر جمع‌وجور که با اسکرول به پایین مخفی و با اسکرول به بالا نمایان می‌شود، اسلایدر با کشیدن انگشت، ردیف‌های محصول قابل کشیدن، مودال و جزئیات محصول به‌صورت bottom-sheet، سبد خرید تمام‌عرض.
- **پنل مدیریت**: منوی کناری در موبایل به نوار پایین تبدیل می‌شود، جدول محصولات و سفارش‌ها به‌صورت کارت نمایش داده می‌شوند و فرم‌ها تک‌ستونه‌اند.
- فیلدها روی موبایل ۱۶px هستند تا iOS هنگام فوکوس زوم نکند، و ناحیهٔ لمس دکمه‌ها حداقل ۴۰–۴۴ پیکسل است.

استایل‌های موبایل در انتهای `frontend/css/style.css` و `frontend/css/admin.css` (بخش «نسخهٔ موبایل») قرار دارند.


## نسخهٔ نمایشی (بدون بک‌اند)

روی GitHub Pages بک‌اند در دسترس نیست؛ بنابراین فروشگاه و پنل در حالت نمایشی کار می‌کنند:

- **پنل مدیریت**: `admin.html` یک پنل کامل دارد (داشبورد، محصولات، سفارش‌ها، تنظیمات و رویدادها). در نسخهٔ استاتیک هیچ بک‌اندی برای بررسی رمز وجود ندارد، بنابراین حالت نمایشی **رمز ندارد** و با هر نام کاربری/رمزی فقط پنل همان مرورگر باز می‌شود. هیچ رمزی در کد، README یا مخزن نیست.
- **هیچ دادهٔ حساسی در مخزن نیست**: نه `.env` واقعی، نه دیتابیس، نه توکن، نه شمارهٔ کارت و نه رمز واقعی. رمزهای سرور فقط از متغیرهای محیطی (`SECRET_KEY`، `JWT_SECRET_KEY`، `SEED_*_PASSWORD`) خوانده می‌شوند و در Render تنظیم می‌گردند.
- محصولات، سفارش‌ها و تنظیمات پنل در همان مرورگر (`localStorage`) ذخیره می‌شوند.
- **پرداخت**: این نمونه‌کار است و **پرداخت واقعی وجود ندارد**؛ مرحلهٔ پرداخت با یک پیام شیک («پرداخت در این نمونه‌کار وجود ندارد») نمایش داده می‌شود، هیچ شمارهٔ کارتی گرفته نمی‌شود و مبلغی از حساب کاربر کم نمی‌شود.
- برای استفادهٔ واقعی، پروژه را روی سرور Flask اجرا کنید تا همهٔ داده‌ها از API خوانده شوند.


## اجرای محلی

اجرای کامل (فرانت هم روی همان سرور سرو می‌شود):

```bash
py -m venv "فایل های مهم/.venv"
"فایل های مهم/.venv/Scripts/python" -m pip install -r backend/requirements.txt

cd backend
cp .env.example "../فایل های مهم/.env"   # سپس SECRET_KEY و JWT_SECRET_KEY را پر کنید
"../فایل های مهم/.venv/Scripts/python" seed.py   # جدول‌ها + کاربران و محصولات اولیه
"../فایل های مهم/.venv/Scripts/python" run.py    # http://127.0.0.1:5000
```

همهٔ چیزهای خصوصی (`.env` واقعی، دیتابیس محلی `digistyle.db`، virtualenv) داخل
پوشهٔ `فایل های مهم` می‌مانند؛ آن پوشه در `.gitignore` است و هرگز آپلود نمی‌شود
(توضیح کامل: `فایل های مهم/README.txt`).

سایت را از `http://127.0.0.1:5000` باز کنید (نه با کلیک روی فایل) تا API در دسترس باشد.
کلیدها از `فایل های مهم/.env` خوانده می‌شوند؛ تولید مقدار:

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
| `POST /api/v1/orders` | عمومی | ثبت سفارش مهمان (قیمت‌ها سمت سرور حساب می‌شود؛ فیلد اختیاری `phone` برای پیگیری) |
| `GET /api/v1/orders/track?code=&phone=` | عمومی | پیگیری سفارش با کد رهگیری (در صورت وجود شماره، تطبیق الزامی است) |
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

## امنیت پنل مدیریت

- **نسخهٔ نمایشی (GitHub Pages) اصلاً رمز ندارد** و این طبیعی است: Pages فقط فایل استاتیک سرو می‌کند و هر رمزی که داخل JS عمومی بگذاریم با یک نگاه به سورس خوانده می‌شود. حالت نمایشی فقط `localStorage` همان مرورگر را تغییر می‌دهد و به هیچ سروری دسترسی ندارد.
- **امنیت واقعی روی بک‌اند Flask است**: رمزها با bcrypt ذخیره می‌شوند، ورود با نشست JWT انجام می‌شود، هر IP+نام کاربری فقط ۵ تلاش ناموفق در ۱۵ دقیقه دارد و رویدادها در `audit_logs` ثبت می‌شوند.
- رمز حساب‌های واقعی هیچ‌جا در مخزن نیست: از `SEED_OWNER_PASSWORD` / `SEED_ADMIN_PASSWORD` (و `SECRET_KEY`، `JWT_SECRET_KEY`) در Environment هاست خوانده می‌شود؛ در production اپ بدون آن‌ها بالا نمی‌آید.
- هیچ توکن، کلید API، رشتهٔ اتصال دیتابیس، شمارهٔ کارت یا اطلاعات شخصی در مخزن یا تاریخچهٔ گیت وجود ندارد.

## استقرار روی GitHub و Render

### ۱) GitHub

```bash
git clone https://github.com/taha01karimi-creator/poshak.1.git
cd poshak.1
git add .
git commit -m "Update: payments disabled in demo + private admin panel"
git push origin main
```

آدرس واقعی مخزن: <https://github.com/taha01karimi-creator/poshak.1> (شاخهٔ `main`، Pages روی همین شاخه فعال است).

`.gitignore` آماده است و `فایل های مهم/` (که `.env`، دیتابیس محلی و `.venv` را در خود دارد)،
دیتابیس‌های SQLite، `__pycache__` و کش‌ها را نادیده می‌گیرد. **قبل از push یک‌بار
`git status` بزنید.**

### ۲) Render (Blueprint)

1. Render Dashboard → **New → Blueprint** → ریپازیتوری را انتخاب کنید.
2. Render از `render.yaml` یک Web Service (`digistyle`) می‌سازد و `DATABASE_URL` را از شما می‌پرسد — رشتهٔ اتصال Neon را همان‌جا بگذارید (پایین‌تر توضیح داده شده).
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
