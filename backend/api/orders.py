"""Order endpoints: guest checkout (public) + admin management (guarded)."""

import secrets

from flask import Blueprint, request

from app import db
from models import Order, OrderItem, Product, Setting
from security.audit import record as audit
from security.auth import jwt_required_middleware, require_permission
from security.csrf import require_csrf
from security.rate_limit import ORDER_LIMIT, TRACK_LIMIT, limiter
from security.sanitize import (
    pagination_params,
    validate_order_payload,
    validate_order_status,
)

bp = Blueprint("orders", __name__)

DEFAULT_THRESHOLD = 5_000_000
DEFAULT_DISCOUNT_AMOUNT = 1_000_000


def final_price(product: Product) -> int:
    """Final (discounted) price — the same number the storefront shows."""
    return int(round(product.price * (100 - (product.discount or 0)) / 100))


def _setting_int(key: str, default: int) -> int:
    row = Setting.query.filter_by(key=key).first()
    if not row:
        return default
    try:
        return int(row.value)
    except (TypeError, ValueError):
        return default


def _discount_for(total: int) -> int:
    threshold = _setting_int("threshold", DEFAULT_THRESHOLD)
    amount = _setting_int("discountAmount", DEFAULT_DISCOUNT_AMOUNT)
    return amount if total >= threshold else 0


def _new_order_id() -> str:
    for _ in range(20):
        candidate = "DIGI-" + secrets.token_hex(3).upper()
        if db.session.get(Order, candidate) is None:
            return candidate
    raise RuntimeError("could not allocate an order id")


@bp.post("/v1/orders")
@limiter.limit(ORDER_LIMIT)
def create_order():
    """Guest checkout. Prices and totals are computed server-side only."""
    data = request.get_json(silent=True) or {}
    payload, error = validate_order_payload(data)
    if error:
        return {"ok": False, "error": error}, 400

    lines = []
    for item in payload["items"]:
        product = db.session.get(Product, item["product_id"])
        if not product:
            return {"ok": False, "error": f"محصول {item['product_id']} یافت نشد"}, 400
        lines.append((product, item["size"], item["qty"]))

    total = sum(final_price(p) * qty for p, _, qty in lines)
    discount = _discount_for(total)

    order = Order(
        id=_new_order_id(),
        customer=payload["customer"],
        phone=payload.get("phone"),
        status="pending",
        total=total,
        discount=discount,
        payable=max(0, total - discount),
    )
    db.session.add(order)
    for product, size, qty in lines:
        db.session.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                title=product.title,
                size=size,
                qty=qty,
                price=final_price(product),
            )
        )
    db.session.commit()
    return {"ok": True, "order": _order_dict(order, include_items=True)}, 201


@bp.get("/v1/orders")
@jwt_required_middleware
@require_permission("orders.read")
def list_orders():
    """List orders (admin). Optional status filter."""
    query = Order.query

    status = request.args.get("status")
    if status:
        query = query.filter(Order.status == status)

    page, per_page = pagination_params(request)
    pagination = query.order_by(Order.date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return {
        "ok": True,
        "orders": [_order_dict(o) for o in pagination.items],
        "total": pagination.total,
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages,
    }


@bp.get("/v1/orders/<order_id>")
@jwt_required_middleware
@require_permission("orders.read")
def get_order(order_id):
    o = Order.query.filter_by(id=order_id).first_or_404()
    return {"ok": True, "order": _order_dict(o, include_items=True)}


@bp.put("/v1/orders/<order_id>")
@jwt_required_middleware
@require_permission("orders.write")
@require_csrf
def update_order(order_id):
    """Update order status (admin only)."""
    o = Order.query.filter_by(id=order_id).first_or_404()
    data = request.get_json(silent=True) or {}
    new_status = validate_order_status(data.get("status"))

    if new_status is None:
        return {"ok": False, "error": "Invalid status"}, 400

    previous = o.status
    o.status = new_status
    audit(
        "order.update",
        target_type="order",
        target_id=o.id,
        details=f"{previous} -> {new_status}",
    )
    db.session.commit()
    return {"ok": True, "order": _order_dict(o, include_items=True)}


@bp.delete("/v1/orders/<order_id>")
@jwt_required_middleware
@require_permission("orders.delete")
@require_csrf
def delete_order(order_id):
    o = Order.query.filter_by(id=order_id).first_or_404()
    # No DB-level cascade: remove the line items first so none are orphaned.
    OrderItem.query.filter_by(order_id=o.id).delete()
    audit("order.delete", target_type="order", target_id=o.id)
    db.session.delete(o)
    db.session.commit()
    return {"ok": True}


@bp.get("/v1/orders/track")
@limiter.limit(TRACK_LIMIT)
def track_order():
    """Public order tracking by tracking code (+ phone verification when available)."""
    order_id = (request.args.get("code") or request.args.get("order_no") or "").strip().upper()[:32]
    phone = (request.args.get("phone") or "").strip()
    if not order_id:
        return {"ok": False, "error": "کد رهگیری الزامی است"}, 400

    o = Order.query.filter_by(id=order_id).first()
    # یک پیام یکسان برای «پیدا نشد» و «موبایل نامنطبق» تا وجود سفارش لو نرود.
    not_found = {"ok": False, "error": "سفارشی با این کد یافت نشد"}, 404
    if not o:
        return not_found
    if o.phone and not phone:
        return {"ok": False, "error": "شماره موبایل الزامی است"}, 400
    if o.phone and phone != o.phone:
        return not_found

    return {
        "ok": True,
        "order": {
            "id": o.id,
            "status": o.status,
            "date": o.date.isoformat() if o.date else None,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "total": o.total,
            "discount": o.discount,
            "payable": o.payable,
            "items": [_item_dict(i) for i in OrderItem.query.filter_by(order_id=o.id).all()],
            "items_count": OrderItem.query.filter_by(order_id=o.id).count(),
        },
    }


def _order_dict(o: Order, include_items: bool = False) -> dict:
    d = {
        "id": o.id,
        "date": o.date.isoformat() if o.date else None,
        "customer": o.customer,
        "phone": o.phone,
        "status": o.status,
        "total": o.total,
        "discount": o.discount,
        "payable": o.payable,
        "items_count": OrderItem.query.filter_by(order_id=o.id).count(),
        "created_at": o.created_at.isoformat() if o.created_at else None,
    }
    if include_items:
        d["items"] = [_item_dict(i) for i in OrderItem.query.filter_by(order_id=o.id).all()]
    return d


def _item_dict(i: OrderItem) -> dict:
    return {
        "id": i.id,
        "product_id": i.product_id,
        "title": i.title,
        "size": i.size,
        "qty": i.qty,
        "price": i.price,
    }
