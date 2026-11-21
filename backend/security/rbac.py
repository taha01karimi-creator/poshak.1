"""Role-based access control helpers exposed to Flask views and middleware."""

from .auth import PERMISSIONS_BY_ROLE, has_permission

ADMIN_ROLES = {"owner", "admin"}
CUSTOMER_ROLE = "customer"


def is_admin(role: str | None) -> bool:
    return role in ADMIN_ROLES


def can(role: str | None, permission: str) -> bool:
    if role is None:
        return False
    return has_permission(role, permission)


def deny_if_not(role: str | None, *permissions: str) -> str | None:
    """Return an error message if the role lacks ALL listed permissions; None if allowed."""
    if role is None:
        return "Authentication required"
    if not any(can(role, p) for p in permissions):
        return "Insufficient permissions"
    return None