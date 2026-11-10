"""Order endpoints."""

from flask import Blueprint, request

from app import db
from models import Order, OrderItem
from security.auth import jwt_required_middleware, require_permission
from security.csrf import require_csrf
from security.sanitize import pagination_params, validate_order_status

bp = Blueprint("orders", __name__)


@bp.get("/v1/orders")
@jwt_required_middleware
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

    o.status = new_status
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
    db.session.delete(o)
    db.session.commit()
    return {"ok": True}


def _order_dict(o: Order, include_items: bool = False) -> dict:
    d = {
        "id": o.id,
        "date": o.date.isoformat() if o.date else None,
        "customer": o.customer,
        "status": o.status,
        "total": o.total,
        "discount": o.discount,
        "payable": o.payable,
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
