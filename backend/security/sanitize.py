"""
Input sanitization & validation for the Digistyle API.

Defensive programming: every value that crosses the API boundary is validated
against an explicit schema before touching the database or being echoed back.
"""
import re
from typing import Any

from flask import Request

# Allowed slugs for product gender / type.
VALID_GENDERS = {"men", "women", "kids"}
VALID_TYPES = {"shoe", "top", "pants", "cold", "warm", "acc"}
VALID_ORDER_STATUSES = {"pending", "processing", "shipped", "delivered", "cancelled"}

# Strict allow-list for page / limit params.
VALID_SORT_FIELDS = {"id", "title", "brand", "price", "created_at", "updated_at"}

# HTML-ish / script chars that should never reach a DB text field verbatim.
# We do not strip silently — we reject with 400 so callers fix their input.
_HTML_META_CHARS = re.compile(r"[<>&\"\']")


def is_safe_text(value: str, max_len: int = 500) -> bool:
    """True if `value` is a short, plain string with no markup-ish characters."""
    if not isinstance(value, str):
        return False
    if not value or len(value) > max_len:
        return False
    return not bool(_HTML_META_CHARS.search(value))


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


def clean_float(value: Any, min_v: float | None = None, max_v: float | None = None) -> float | None:
    try:
        num = float(value)
    except (TypeError, ValueError):
        return None
    if min_v is not None and num < min_v:
        return None
    if max_v is not None and num > max_v:
        return None
    return num


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
        "title": title.strip(),
        "brand": brand.strip(),
        "emoji": emoji.strip(),
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

    return {
        "promoText": promo.strip(),
        "threshold": threshold,
        "discountAmount": amount,
    }, None


def validate_order_status(status: str | None) -> str | None:
    if status not in VALID_ORDER_STATUSES:
        return None
    return status