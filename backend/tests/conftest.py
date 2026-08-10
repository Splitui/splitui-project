import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from app.db.database import metadata
from app.db.dependencies import get_connection
from app.main import app


@pytest.fixture
def test_bd_engine(tmp_path):
    database_path = tmp_path / "tests.db"

    engine = create_engine(
        url = f"sqlite:///{database_path}",
    )

    metadata.create_all(engine)

    yield engine

    engine.dispose()

@pytest.fixture
def test_app_client(test_bd_engine):

    def override_get_connection():
        with test_bd_engine.connect() as connection:
            yield connection

    app.dependency_overrides[get_connection] = override_get_connection

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

