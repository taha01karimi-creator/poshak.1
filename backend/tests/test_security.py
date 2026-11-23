
import hashlib
import hmac
import json
import time
from urllib.parse import urlencode

import pytest

from app import db
from models import Order, Setting
from security.sanitize import validate_product
from security.telegram import verify_init_data

GOOD_PHONE = "09121234567"

def _fail_login(client, username="ghost", password="wrong-password", headers=None):
    return client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
        headers=headers or {},
    )

def _place_order(client, product, phone=GOOD_PHONE):
    return client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": product.id, "size": "M", "qty": 2}],
            "customer": "تست",
            "phone": phone,
        },
    )

# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
def test_xff_is_ignored_without_trusted_proxy(app, client):
    @app.get("/_test/ip")
    def _ip():
        from flask import request

        return {"ip": request.remote_addr}

    body = client.get("/_test/ip", headers={"X-Forwarded-For": "203.0.113.7"}).get_json()
    assert app.config["TRUSTED_PROXY_HOPS"] == 0
    assert body["ip"] == "127.0.0.1"

def test_spoofed_xff_cannot_bypass_login_limit(limited_client):
    statuses = [
        _fail_login(limited_client, headers={"X-Forwarded-For": f"10.0.0.{i}"}).status_code
        for i in range(5)
    ]
    assert statuses == [401] * 5

    blocked = _fail_login(limited_client, headers={"X-Forwarded-For": "198.51.100.99"})
    assert blocked.status_code == 429

# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
def test_track_limit_is_enforced_despite_spoofed_xff(limited_client):
    statuses = [
        limited_client.get(
            "/api/v1/orders/track?code=CL-UNKNOWN&phone=09120000000",
            headers={"X-Forwarded-For": f"198.51.100.{i}"},
        ).status_code
        for i in range(31)
    ]
    assert statuses[:30] == [404] * 30
    assert statuses[30] == 429

# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
def test_order_requires_phone(client, product):
    missing = client.post(
        "/api/v1/orders",
        json={"items": [{"product_id": product.id, "qty": 1, "size": "M"}]},
    )
    assert missing.status_code == 400
    assert "phone" in missing.get_json()["error"]

    invalid = client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": product.id, "qty": 1, "size": "M"}],
            "phone": "12345",
        },
    )
    assert invalid.status_code == 400

def test_tracking_code_is_64_bit(client, product):
    response = _place_order(client, product)
    assert response.status_code == 201
    code = response.get_json()["order"]["id"]
    assert code.startswith("CL-")
    assert len(code) == len("CL-") + 16  # token_hex(8)

def test_track_never_leaks_order_without_phone(client, product):
    code = _place_order(client, product).get_json()["order"]["id"]

    assert client.get(f"/api/v1/orders/track?code={code}").status_code == 400
    assert (
        client.get(f"/api/v1/orders/track?code={code}&phone=09129999999").status_code
        == 404
    )

    ok = client.get(f"/api/v1/orders/track?code={code}&phone={GOOD_PHONE}")
    assert ok.status_code == 200
    assert ok.get_json()["order"]["items"]

def test_legacy_order_without_phone_is_not_trackable(client):
    db.session.add(
        Order(
            id="CL-AAAAAAAA",
            customer="قدیمی",
            phone=None,
            status="pending",
            total=5_000,
            discount=0,
            payable=5_000,
        )
    )
    db.session.commit()

    response = client.get(f"/api/v1/orders/track?code=CL-AAAAAAAA&phone={GOOD_PHONE}")
    assert response.status_code == 404

# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
def test_huge_price_is_rejected_before_touching_database():
    payload, error = validate_product(
        {
            "title": "کفش",
            "brand": "برند",
            "emoji": "👟",
            "gender": "men",
            "type": "shoe",
            "price": 10**30,
        }
    )
    assert payload is None
    assert "price" in error

def test_price_upper_bound_accepts_reasonable_value():
    payload, error = validate_product(
        {
            "title": "کفش",
            "brand": "برند",
            "emoji": "👟",
            "gender": "men",
            "type": "shoe",
            "price": 1_000_000_000,
        }
    )
    assert error is None
    assert payload["price"] == 1_000_000_000

# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
def test_settings_endpoint_only_exposes_public_keys(client):
    db.session.add_all(
        [
            Setting(key="promoText", value="تخفیف"),
            Setting(key="threshold", value="5000000"),
            Setting(key="discountAmount", value="1000000"),
            Setting(key="internalSecret", value="s3cr3t"),
        ]
    )
    db.session.commit()

    settings = client.get("/api/v1/settings").get_json()["settings"]
    assert set(settings) == {"promoText", "threshold", "discountAmount"}
    assert "s3cr3t" not in json.dumps(settings, ensure_ascii=False)

# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
def test_missing_user_still_runs_bcrypt(monkeypatch, client):
    from api import auth as auth_api

    calls = []
    monkeypatch.setattr(auth_api, "_consume_dummy_verify", lambda pw: calls.append(pw))

    assert _fail_login(client, username="does-not-exist").status_code == 401
    assert calls == ["wrong-password"]

# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
def test_seed_rejects_short_password(monkeypatch):
    import seed as seed_module

    monkeypatch.setenv("SEED_OWNER_PASSWORD", "short-pass")
    with pytest.raises(RuntimeError):
        seed_module._password_for("SEED_OWNER_PASSWORD", required=True)

def test_seed_rejects_default_usernames_when_required(monkeypatch):
    import seed as seed_module

    monkeypatch.delenv("SEED_OWNER_USERNAME", raising=False)
    with pytest.raises(RuntimeError):
        seed_module._username_for("SEED_OWNER_USERNAME", "owner", required=True)

    monkeypatch.setenv("SEED_OWNER_USERNAME", "taha-owner")
    assert (
        seed_module._username_for("SEED_OWNER_USERNAME", "owner", required=True)
        == "taha-owner"
    )

# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
def _signed_init_data(token, user, auth_date=None):
    stamp = int(auth_date if auth_date is not None else time.time())
    data = {
        "auth_date": str(stamp),
        "query_id": "AAH-test",
        "user": json.dumps(user, separators=(",", ":")),
    }
    check_string = "\n".join(f"{key}={data[key]}" for key in sorted(data))
    secret = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
    data["hash"] = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()
    return urlencode(data)

def test_telegram_init_data_signature():
    token = "123456:TEST-TOKEN"
    raw = _signed_init_data(token, {"id": 42, "first_name": "Taha"})

    verified = verify_init_data(raw, token)
    assert verified and verified["user"]["id"] == 42

    assert verify_init_data(raw, "999999:OTHER-TOKEN") is None
    assert verify_init_data(raw.replace("42", "43"), token) is None
    assert verify_init_data("", token) is None

def test_telegram_init_data_expired():
    token = "123456:TEST-TOKEN"
    old = int(time.time()) - 3 * 24 * 60 * 60
    raw = _signed_init_data(token, {"id": 1}, auth_date=old)
    assert verify_init_data(raw, token) is None

def test_telegram_endpoint_requires_configuration(client):
    client.application.config["TELEGRAM_BOT_TOKEN"] = ""
    response = client.post("/api/v1/auth/telegram", json={"initData": "hash=abc"})
    assert response.status_code == 503

def test_telegram_endpoint_verifies_signature(client):
    token = "123456:ABC"
    client.application.config["TELEGRAM_BOT_TOKEN"] = token
    raw = _signed_init_data(token, {"id": 7, "username": "taha"})

    ok = client.post("/api/v1/auth/telegram", json={"initData": raw})
    assert ok.status_code == 200
    assert ok.get_json()["telegram"]["id"] == 7

    tampered = client.post("/api/v1/auth/telegram", json={"initData": raw + "&user=x"})
    assert tampered.status_code == 401
