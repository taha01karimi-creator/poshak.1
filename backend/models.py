"""SQLAlchemy models for the Digistyle backend."""

from datetime import datetime, timezone

# The shared instance lives in app.py; importing it here guarantees models and
# `db.init_app(app)` refer to the same SQLAlchemy object.
from app import db


class User(db.Model):
    """Admin / staff account."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="admin")  # owner | admin | customer
    title = db.Column(db.String(120), default="مدیر سایت")
    is_active = db.Column(db.Boolean, default=True)
    failed_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime, nullable=True, default=None)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<User {self.username} {self.role}>"


class Product(db.Model):
    """A product in the catalogue."""

    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    emoji = db.Column(db.String(10), default="👕")
    gender = db.Column(db.String(10), nullable=False, default="men")  # men | women | kids
    type = db.Column(db.String(10), nullable=False, default="shoe")  # shoe | top | pants | cold | warm | acc
    price = db.Column(db.Integer, nullable=False)  # in tomans
    discount = db.Column(db.Integer, default=0)  # percentage 0-90

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<Product {self.id} {self.title}>"


class RefreshToken(db.Model):
    """A refresh token stored server-side so it can be revoked."""

    __tablename__ = "refresh_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    jti = db.Column(db.String(64), unique=True, nullable=False)
    token_hash = db.Column(db.String(255), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<RefreshToken {self.jti}>"


class Order(db.Model):
    """A customer order."""

    __tablename__ = "orders"

    id = db.Column(db.String(32), primary_key=True)  # e.g. DIGI-A1B2C3
    date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    customer = db.Column(db.String(80), default="مهمان")
    status = db.Column(db.String(20), default="pending")  # pending | processing | shipped | delivered | cancelled
    total = db.Column(db.Integer, default=0)
    discount = db.Column(db.Integer, default=0)
    payable = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<Order {self.id} {self.status}>"


class OrderItem(db.Model):
    """An individual product line inside an order."""

    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(32), db.ForeignKey("orders.id"), nullable=False, index=True)
    product_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    size = db.Column(db.String(16), default="S")
    qty = db.Column(db.Integer, default=1)
    price = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f"<OrderItem {self.id} order={self.order_id}>"


class Setting(db.Model):
    """Key-value shop settings (single-row table)."""

    __tablename__ = "settings"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(80), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f"<Setting {self.key}>"


class AuditLog(db.Model):
    """Audit trail of admin actions."""

    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    user_role = db.Column(db.String(20), nullable=False)
    action = db.Column(db.String(80), nullable=False)  # e.g. product.create, order.update
    target_type = db.Column(db.String(40))
    target_id = db.Column(db.String(80))
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<AuditLog {self.action} by {self.user_id}>"
