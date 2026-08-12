from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from app.db.database import metadata
from app.db.dependencies import get_connection
from app.main import app
from app.repositories import meetings_repository, participants_repository
from tests.utils import future_date


@pytest.fixture
def db_engine(tmp_path):
    db_path = tmp_path / "tests.db"

    engine = create_engine(f"sqlite:///{db_path}")

    metadata.create_all(engine)

    yield engine

    engine.dispose()


@pytest.fixture
def app_client(db_engine):
    def override_get_connection():
        with db_engine.connect() as connection:
            yield connection

    app.dependency_overrides[get_connection] = override_get_connection

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def create_meeting(db_engine):
    def _create_meeting(
            title="Тестовая Встреча",
            start_date: datetime = future_date(),
            creator_nickname="Тестовый создатель"
    ):
        with db_engine.begin() as connection:
            meeting = meetings_repository.create(connection, title, start_date)
            participants_repository.create(connection, meeting["id"], creator_nickname, True)

            return meeting

    return _create_meeting


@pytest.fixture
def create_participant(db_engine):
    def _create_participant(meeting_id, nickname="Тестовый участник", is_creator=False):
        with db_engine.begin() as connection:
            participant = participants_repository.create(connection, meeting_id, nickname, is_creator)

            return participant

    return _create_participant
