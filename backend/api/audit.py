"""Audit log endpoint (owner only)."""

from flask import Blueprint, request

from models import AuditLog
from security.auth import jwt_required_middleware, require_permission
from security.sanitize import pagination_params

bp = Blueprint("audit", __name__)


@bp.get("/v1/audit-logs")
@jwt_required_middleware
@require_permission("audit.read")
def list_audit_logs():
    query = AuditLog.query.order_by(AuditLog.created_at.desc())

    action = request.args.get("action")
    if action:
        query = query.filter(AuditLog.action == action)

    page, per_page = pagination_params(request)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return {
        "ok": True,
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "user_role": log.user_role,
                "action": log.action,
                "target_type": log.target_type,
                "target_id": log.target_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in pagination.items
        ],
        "total": pagination.total,
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages,
    }
