"""Dashboard statistics endpoint."""

from flask import Blueprint, request, g
from sqlalchemy import func

from app import db
from models import Product, Order
from security.auth import jwt_required_middleware

bp = Blueprint("dashboard", __name__)


@bp.get("/v1/dashboard/stats")
@jwt_required_middleware
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
            "by_gender": {g: c for g, c in products_by_gender},
            "by_type": {t: c for t, c in products_by_type},
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
