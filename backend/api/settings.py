"""Shop settings endpoints (owner only)."""

from flask import Blueprint, request, g

from app import db
from models import Setting
from security.auth import jwt_required_middleware, require_permission
from security.csrf import require_csrf
from security.sanitize import validate_settings

bp = Blueprint("settings", __name__)


@bp.get("/v1/settings")
@jwt_required_middleware
def list_settings():
    rows = Setting.query.all()
    return {"ok": True, "settings": {r.key: r.value for r in rows}}


@bp.put("/v1/settings")
@jwt_required_middleware
@require_permission("settings")
@require_csrf
def update_settings():
    data = request.get_json(silent=True) or {}
    payload, error = validate_settings(data)
    if error:
        return {"ok": False, "error": error}, 400

    for k, v in payload.items():
        row = Setting.query.filter_by(key=k).first()
        if row:
            row.value = str(v)
        else:
            db.session.add(Setting(key=k, value=str(v)))
    db.session.commit()
    return {"ok": True, "settings": payload}
