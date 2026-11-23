
import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl

DEFAULT_MAX_AGE = 24 * 60 * 60

def verify_init_data(
    init_data: str,
    bot_token: str,
    *,
    max_age: int = DEFAULT_MAX_AGE,
    now: float | None = None,
) -> dict | None:
    if not isinstance(init_data, str) or not init_data.strip():
        return None
    if not isinstance(bot_token, str) or not bot_token:
        return None

    try:
        pairs = parse_qsl(init_data, keep_blank_values=True, strict_parsing=True)
    except ValueError:
        return None
    if not pairs:
        return None

    data = dict(pairs)
    received_hash = data.pop("hash", "")
    if not received_hash:
        return None

    check_string = "\n".join(f"{key}={data[key]}" for key in sorted(data))
    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    expected_hash = hmac.new(
        secret_key, check_string.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash.lower()):
        return None

    try:
        auth_date = int(data.get("auth_date", "0"))
    except (TypeError, ValueError):
        return None
    if max_age and (now or time.time()) - auth_date > max_age:
        return None

    user = None
    raw_user = data.get("user")
    if raw_user:
        try:
            user = json.loads(raw_user)
        except (TypeError, ValueError):
            return None
        if not isinstance(user, dict):
            return None

    return {"auth_date": auth_date, "user": user, "data": data}
