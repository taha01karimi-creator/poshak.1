
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pytest  # noqa: E402

from app import create_app, db  # noqa: E402

def _make(config_name: str):
    application = create_app(config_name)
    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()

@pytest.fixture()
def app():
    yield from _make("testing")

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.fixture()
def limited_app():
    yield from _make("testing_limited")

@pytest.fixture()
def limited_client(limited_app):
    return limited_app.test_client()

@pytest.fixture()
def product(app):
    from models import Product

    row = Product(
        title="کفش تست",
        brand="برند تست",
        emoji="👟",
        gender="men",
        type="shoe",
        price=1_000_000,
        discount=0,
    )
    db.session.add(row)
    db.session.commit()
    return row
