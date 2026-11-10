"""Production WSGI entry point (gunicorn, uWSGI, ...).

Render starts the service with:
    gunicorn --chdir backend --bind 0.0.0.0:$PORT wsgi:app

Unlike run.py this defaults to the production config, so missing secrets or a
missing DATABASE_URL fail loudly at boot instead of falling back to SQLite.
"""

import os

from app import create_app

app = create_app(os.environ.get("FLASK_ENV", "production"))
