"""Dashboard statistics endpoint (admin roles only)."""

from flask import Blueprint
from sqlalchemy import func

from app import db
from models import Order, Product
from security.auth import jwt_required_middleware, require_permission

bp = Blueprint("dashboard", __name__)


@bp.get("/v1/dashboard/stats")
@jwt_required_middleware
@require_permission("dashboard.read")
def stats():
    total_products = Product.query.count()
    total_orders = Order.query.count()

    revenue = (
        db.session.query(func.sum(Order.payable))
        .filter(Order.status != "cancelled")
        .scalar()
        or 0
    )
    discounted_products = Product.query.filter(Product.discount > 0).count()

    products_by_gender = (
        db.session.query(Product.gender, func.count(Product.id))
        .group_by(Product.gender)
        .all()
    )
    products_by_type = (
        db.session.query(Product.type, func.count(Product.id)).group_by(Product.type).all()
    )

    recent = Order.query.order_by(Order.date.desc()).limit(5).all()

    return {
        "ok": True,
        "stats": {
            "total_products": total_products,
            "total_orders": total_orders,
            "revenue_toman": int(revenue),
            "discounted_products": discounted_products,
            "by_gender": {gender: count for gender, count in products_by_gender},
            "by_type": {ptype: count for ptype, count in products_by_type},
        },
        "recent_orders": [
            {
                "id": o.id,
                "date": o.date.isoformat() if o.date else None,
                "customer": o.customer,
                "status": o.status,
                "payable": o.payable,
            }
            for o in recent
        ],
    }
