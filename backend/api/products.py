"""Product CRUD endpoints."""

from flask import Blueprint, request

from app import db
from models import Product
from security.auth import jwt_required_middleware, require_permission
from security.csrf import require_csrf
from security.sanitize import pagination_params, validate_product

bp = Blueprint("products", __name__)


@bp.get("/v1/products")
@jwt_required_middleware
def list_products():
    """List all products with optional filtering & pagination."""
    query = Product.query

    gender = request.args.get("gender")
    ptype = request.args.get("type")
    search = request.args.get("search")

    if gender:
        query = query.filter(Product.gender == gender)
    if ptype:
        query = query.filter(Product.type == ptype)
    if search:
        like = f"%{search}%"
        query = query.filter(Product.title.ilike(like) | Product.brand.ilike(like))

    page, per_page = pagination_params(request)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return {
        "ok": True,
        "products": [_product_dict(p) for p in pagination.items],
        "total": pagination.total,
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages,
    }


@bp.get("/v1/products/<int:product_id>")
@jwt_required_middleware
def get_product(product_id):
    p = Product.query.get_or_404(product_id)
    return {"ok": True, "product": _product_dict(p)}


@bp.post("/v1/products")
@jwt_required_middleware
@require_permission("products.write")
@require_csrf
def create_product():
    data = request.get_json(silent=True) or {}
    payload, error = validate_product(data)
    if error:
        return {"ok": False, "error": error}, 400

    p = Product(**payload)
    db.session.add(p)
    db.session.commit()
    return {"ok": True, "product": _product_dict(p)}, 201


@bp.put("/v1/products/<int:product_id>")
@jwt_required_middleware
@require_permission("products.write")
@require_csrf
def update_product(product_id):
    p = Product.query.get_or_404(product_id)
    data = request.get_json(silent=True) or {}
    payload, error = validate_product(data)
    if error:
        return {"ok": False, "error": error}, 400

    for k, v in payload.items():
        setattr(p, k, v)
    db.session.commit()
    return {"ok": True, "product": _product_dict(p)}


@bp.delete("/v1/products/<int:product_id>")
@jwt_required_middleware
@require_permission("products.delete")
@require_csrf
def delete_product(product_id):
    p = Product.query.get_or_404(product_id)
    db.session.delete(p)
    db.session.commit()
    return {"ok": True}


def _product_dict(p: Product) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "brand": p.brand,
        "emoji": p.emoji,
        "gender": p.gender,
        "type": p.type,
        "price": p.price,
        "discount": p.discount,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }
