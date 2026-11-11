"""Input sanitization & validation for the Digistyle API.

قاعده: ورودی را همان‌طور که هست بپذیر (&، '، " و کاراکترهای فارسی مجاز هستند)
و هنگام نمایش escape کن. فقط کاراکترهای کنترلی و ورودی خالی/بیش‌ازحد رد می‌شوند.
"""
import re
from typing import Any

from flask import Request

VALID_GENDERS = {"men", "women", "kids"}
VALID_TYPES = {"shoe", "top", "pants", "cold", "warm", "acc"}
VALID_ORDER_STATUSES = {"pending", "processing", "shipped", "delivered", "cancelled"}

VALID_SORT_FIELDS = {"id", "title", "brand", "price", "created_at", "updated_at"}

# کاراکترهای کنترلی (به‌جز \n و \t) در متن‌های کاربر نباید باشند.
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def normalize_text(value: Any, max_len: int = 500) -> str:
    """Strip control chars and surrounding whitespace, then cut to max_len."""
    if not isinstance(value, str):
        return ""
    return _CONTROL_CHARS.sub("", value).strip()[:max_len]


def is_safe_text(value: str, max_len: int = 500) -> bool:
    """True if `value` is a non-empty plain string within the length limit."""
    if not isinstance(value, str):
        return False
    text = value.strip()
    if not text or len(text) > max_len:
        return False
    return not bool(_CONTROL_CHARS.search(text))


def clean_int(value: Any, min_v: int | None = None, max_v: int | None = None) -> int | None:
    """Coerce a value to int; return None on failure."""
    try:
        num = int(value)
    except (TypeError, ValueError):
        return None
    if min_v is not None and num < min_v:
        return None
    if max_v is not None and num > max_v:
        return None
    return num


def pagination_params(
    request: Request, default_per_page: int = 50, max_per_page: int = 100
) -> tuple[int, int]:
    """Parse ?page & ?per_page safely (non-numeric input falls back, no 500)."""
    page = request.args.get("page", type=int) or 1
    per_page = request.args.get("per_page", type=int) or default_per_page
    return max(1, page), max(1, min(per_page, max_per_page))


def validate_product(payload: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    """Validate & sanitize a product create/update payload."""
    title = payload.get("title")
    brand = payload.get("brand")
    emoji = payload.get("emoji", "🛍️")
    gender = payload.get("gender")
    ptype = payload.get("type")
    price = clean_int(payload.get("price"), min_v=1)
    discount = clean_int(payload.get("discount", 0), min_v=0, max_v=90)

    if not is_safe_text(title, max_len=200):
        return None, "title is required (1-200 plain-text chars)"
    if not is_safe_text(brand, max_len=100):
        return None, "brand is required (1-100 plain-text chars)"
    if not isinstance(emoji, str) or len(emoji) > 10:
        return None, "emoji must be at most 10 chars"
    if gender not in VALID_GENDERS:
        return None, "gender must be one of: men, women, kids"
    if ptype not in VALID_TYPES:
        return None, "type must be one of: shoe, top, pants, cold, warm, acc"
    if price is None:
        return None, "price must be a positive integer"
    if discount is None:
        return None, "discount must be between 0 and 90"

    return {
        "title": normalize_text(title, 200),
        "brand": normalize_text(brand, 100),
        "emoji": normalize_text(emoji, 10) or "🛍️",
        "gender": gender,
        "type": ptype,
        "price": price,
        "discount": discount,
    }, None


def validate_settings(payload: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    """Validate shop settings."""
    promo = payload.get("promoText", "")
    threshold = clean_int(payload.get("threshold"), min_v=1)
    amount = clean_int(payload.get("discountAmount"), min_v=0)

    if not isinstance(promo, str) or len(promo) > 500:
        return None, "promoText must be at most 500 chars"
    if threshold is None:
        return None, "threshold must be a positive integer"
    if amount is None:
        return None, "discountAmount must be a non-negative integer"
    if amount >= threshold:
        return None, "discountAmount must be smaller than threshold"

    return {
        "promoText": normalize_text(promo, 500),
        "threshold": threshold,
        "discountAmount": amount,
    }, None


def validate_order_payload(payload: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    """Validate a guest checkout request. Prices are never taken from the client."""
    if not isinstance(payload, dict):
        return None, "invalid payload"

    raw_items = payload.get("items")
    if not isinstance(raw_items, list) or not raw_items:
        return None, "items must be a non-empty list"
    if len(raw_items) > 50:
        return None, "too many items (max 50)"

    items = []
    for raw in raw_items:
        if not isinstance(raw, dict):
            return None, "each item must be an object"
        product_id = clean_int(raw.get("product_id"), min_v=1)
        qty = clean_int(raw.get("qty", 1), min_v=1, max_v=20)
        size = normalize_text(raw.get("size", ""), max_len=16) or "تک‌سایز"
        if product_id is None:
            return None, "product_id is required for every item"
        if qty is None:
            return None, "qty must be between 1 and 20"
        items.append({"product_id": product_id, "size": size, "qty": qty})

    customer = normalize_text(payload.get("customer", ""), max_len=80) or "مهمان"
    return {"items": items, "customer": customer}, None


def validate_order_status(status: str | None) -> str | None:
    if status not in VALID_ORDER_STATUSES:
        return None
    return status
