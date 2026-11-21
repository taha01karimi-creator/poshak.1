"""Seed initial admin users, products & settings into a fresh database."""

import os
import secrets
import sys

# Windows consoles default to a legacy code page; never crash on Persian output.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from models import Product, User, Setting
from security.auth import hash_password


SEED_PRODUCTS = [
    # (title, brand, emoji, gender, type, price, discount)
    ("کفش رانینگ مردانه", "نایکی", "👟", "men", "shoe", 17900000, 0),
    ("کفش رسمی چرم مردانه", "دیفکتو", "👞", "men", "shoe", 23400000, 10),
    ("نیم‌بوت مردانه", "ال سی وایکیکی", "🥾", "men", "shoe", 14500000, 0),
    ("تی‌شرت آستین کوتاه مردانه", "نایکی", "👕", "men", "top", 1990000, 15),
    ("پولوشرت مردانه", "دیفکتو", "👕", "men", "top", 3400000, 0),
    ("پیراهن آستین بلند مردانه", "ال سی وایکیکی", "👔", "men", "top", 4200000, 0),
    ("شلوار جین راسته مردانه", "دیفکتو", "👖", "men", "pants", 6850000, 20),
    ("شلوار کتان مردانه", "ال سی وایکیکی", "👖", "men", "pants", 5200000, 0),
    ("شلوار اسلک مردانه", "نایکی", "👖", "men", "pants", 7100000, 0),
    ("کاپشن پافر مردانه", "دیفکتو", "🧥", "men", "cold", 18900000, 30),
    ("پلیور بافت مردانه", "ال سی وایکیکی", "🧶", "men", "cold", 6300000, 0),
    ("کت چرم مردانه", "کلمبیا", "🧥", "men", "cold", 34000000, 0),
    ("شلوارک مردانه", "نایکی", "🩳", "men", "warm", 2700000, 0),
    ("پیراهن کتان مردانه", "ال سی وایکیکی", "👔", "men", "warm", 3900000, 0),
    ("تی‌شرت نخی تابستانی مردانه", "دیفکتو", "👕", "men", "warm", 1500000, 0),
    ("ساعت مچی مردانه", "نایکی", "⌚", "men", "acc", 15900000, 10),
    ("کیف دوشی مردانه", "دیفکتو", "👜", "men", "acc", 6200000, 0),
    ("کفش رانینگ زنانه", "نایکی", "👟", "women", "shoe", 17900000, 0),
    ("کفش پاشنه‌دار زنانه", "ال سی وایکیکی", "👠", "women", "shoe", 9400000, 15),
    ("نیم‌بوت زنانه", "دیفکتو", "🥾", "women", "shoe", 22700000, 0),
    ("شومیز زنانه", "ال سی وایکیکی", "👚", "women", "top", 1990000, 0),
    ("تی‌شرت اورسایز زنانه", "ایزی دو", "👕", "women", "top", 1990000, 0),
    ("کراپ‌تاپ زنانه", "ایزی دو", "👚", "women", "top", 1460000, 0),
    ("شلوار جین زنانه", "ال سی وایکیکی", "👖", "women", "pants", 2040000, 10),
    ("شلوار پارچه‌ای زنانه", "ایزی دو", "👖", "women", "pants", 2900000, 0),
    ("ساپورت ورزشی زنانه", "ایزی دو", "👖", "women", "pants", 1200000, 0),
    ("کاپشن بلند زنانه", "دیفکتو", "🧥", "women", "cold", 5000000, 0),
    ("پالتو زنانه", "ال سی وایکیکی", "🧥", "women", "cold", 8800000, 0),
    ("ژاکت بافت زنانه", "ایزی دو", "🧶", "women", "cold", 3100000, 0),
    ("سارافون تابستانی زنانه", "ایزی دو", "👗", "women", "warm", 2600000, 0),
    ("مانتو کتان زنانه", "ال سی وایکیکی", "👘", "women", "warm", 3700000, 0),
    ("شلوارک زنانه", "ایزی دو", "🩳", "women", "warm", 1300000, 0),
    ("کیف دوشی چرم زنانه", "ال سی وایکیکی", "👜", "women", "acc", 6200000, 0),
    ("ساعت مچی زنانه", "نایکی", "⌚", "women", "acc", 8800000, 0),
    ("کفش اسپرت بچگانه", "نایکی", "👟", "kids", "shoe", 5600000, 0),
    ("کفش دخترانه", "ال سی وایکیکی", "👟", "kids", "shoe", 4800000, 0),
    ("چکمه بچگانه", "دیفکتو", "🥾", "kids", "shoe", 5200000, 0),
    ("تی‌شرت پسرانه", "نایکی", "👕", "kids", "top", 1200000, 0),
    ("بلوز دخترانه", "ایزی دو", "👚", "kids", "top", 1500000, 10),
    ("سویشرت بچگانه", "ال سی وایکیکی", "🧒", "kids", "top", 3500000, 0),
    ("شلوار جین پسرانه", "نایکی", "👖", "kids", "pants", 3200000, 0),
    ("شلوار کتان دخترانه", "ایزی دو", "👖", "kids", "pants", 2800000, 0),
    ("ساپورت دخترانه", "ایزی دو", "👖", "kids", "pants", 1100000, 0),
    ("بارانی پسرانه", "نایکی", "🧥", "kids", "cold", 5900000, 0),
    ("کاپشن دخترانه", "ال سی وایکیکی", "🧥", "kids", "cold", 7300000, 0),
    ("پلیور بچگانه", "دیفکتو", "🧶", "kids", "cold", 2900000, 0),
    ("پیراهن دخترانه گلدار", "ایزی دو", "👗", "kids", "warm", 1700000, 0),
    ("شلوارک پسرانه", "نایکی", "🩳", "kids", "warm", 1300000, 0),
    ("ست تابستانی نوزادی", "ال سی وایکیکی", "🍼", "kids", "warm", 2500000, 0),
]


def _username_for(env_name: str, default: str) -> str:
    return (os.environ.get(env_name) or default).strip() or default


def _password_for(env_name: str, required: bool = False) -> tuple[str, bool]:
    """Return (password, was_generated) for a seed account.

    In production ``required`` is True: a missing password stops the boot instead
    of printing a random one into the deploy log.
    """
    configured = os.environ.get(env_name)
    if configured:
        return configured, False
    if required:
        raise RuntimeError(
            f"{env_name} باید تعیین شود؛ در production رمز تصادفی ساخته نمی‌شود."
        )
    return secrets.token_urlsafe(12), True


def seed(app=None):
    """Seed an empty database. Pass an app to reuse an existing instance."""
    app = app or create_app()
    with app.app_context():
        db.create_all()
        require_passwords = bool(app.config.get("REQUIRE_SEED_PASSWORDS"))

        # ---- Admin users ----
        # Passwords come from the environment. When they are absent we generate
        # a throwaway one and print it once, so no credential ever lives in Git.
        owner_username = _username_for("SEED_OWNER_USERNAME", "owner")
        owner = User.query.filter_by(username=owner_username).first()
        if not owner:
            owner_pw, owner_generated = _password_for(
                "SEED_OWNER_PASSWORD", required=require_passwords
            )
            owner = User(
                username=owner_username,
                password_hash=hash_password(owner_pw),
                role="owner",
                title="مالک فروشگاه",
            )
            db.session.add(owner)
            if owner_generated:
                print(f"⚠️  رمز ساخته‌شده برای {owner_username} (یک‌بار نمایش داده می‌شود): {owner_pw}")

        admin_username = _username_for("SEED_ADMIN_USERNAME", "admin")
        admin = User.query.filter_by(username=admin_username).first()
        if not admin:
            admin_pw, admin_generated = _password_for(
                "SEED_ADMIN_PASSWORD", required=require_passwords
            )
            admin = User(
                username=admin_username,
                password_hash=hash_password(admin_pw),
                role="admin",
                title="مدیر سایت",
            )
            db.session.add(admin)
            if admin_generated:
                print(f"⚠️  رمز ساخته‌شده برای {admin_username} (یک‌بار نمایش داده می‌شود): {admin_pw}")

        # ---- Products ----
        if Product.query.count() == 0:
            for title, brand, emoji, gender, ptype, price, discount in SEED_PRODUCTS:
                db.session.add(
                    Product(
                        title=title,
                        brand=brand,
                        emoji=emoji,
                        gender=gender,
                        type=ptype,
                        price=price,
                        discount=discount,
                    )
                )

        # ---- Settings ----
        defaults = {
            "promoText": "یک میلیون تومان تخفیف برای خرید بالای ۵ میلیون تومان",
            "threshold": "5000000",
            "discountAmount": "1000000",
        }
        for k, v in defaults.items():
            if not Setting.query.filter_by(key=k).first():
                db.session.add(Setting(key=k, value=v))

        db.session.commit()
        print("✅ Seed complete.")


if __name__ == "__main__":
    seed()
