"""ثبت رویدادهای مدیریتی (AuditLog) برای تغییرات حساس."""

from flask import g, request

from app import db
from models import AuditLog


def record(action: str, target_type: str | None = None, target_id=None, details: str | None = None) -> None:
    """Add an audit row to the current session (caller commits)."""
    payload = getattr(g, "user", None) or {}
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        return  # بدون کاربر معتبر چیزی ثبت نمی‌شود

    db.session.add(
        AuditLog(
            user_id=user_id,
            user_role=payload.get("role") or "unknown",
            action=action,
            target_type=target_type,
            target_id=str(target_id) if target_id is not None else None,
            details=details,
            ip_address=request.remote_addr,
        )
    )
