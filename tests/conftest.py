import os
import tempfile

_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
_tmp.close()

os.environ["DATABASE_URL"] = f"sqlite:///{_tmp.name}"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-at-least-32-characters-long"
os.environ["ADMIN_BOOTSTRAP_EMAIL"] = "admin@test.local"
os.environ["ADMIN_BOOTSTRAP_PASSWORD"] = "password12345678"
os.environ["RATE_LIMIT_WRITE"] = "1000/minute"
os.environ["FRONTEND_ORIGINS"] = "http://testserver"

import app.models  # noqa: F401, E402 - register models with SQLAlchemy metadata

from app.db.base import Base
from app.db.session import engine
from app.main import create_app
from fastapi.testclient import TestClient
import pytest


@pytest.fixture
def client() -> TestClient:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    app = create_app()
    with TestClient(app) as c:
        yield c
