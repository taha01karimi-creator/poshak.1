"""Digistyle API package — aggregates the route modules onto one blueprint."""

from flask import Blueprint

api_bp = Blueprint("api", __name__)

# Route modules each define their own `bp`; importing them here registers their
# routes on that blueprint, which is then nested under `api_bp` below.
from api import audit as _audit  # noqa: E402
from api import auth as _auth  # noqa: E402
from api import dashboard as _dashboard  # noqa: E402
from api import orders as _orders  # noqa: E402
from api import products as _products  # noqa: E402
from api import settings as _settings  # noqa: E402

for _module in (_auth, _products, _orders, _settings, _dashboard, _audit):
    api_bp.register_blueprint(_module.bp)
