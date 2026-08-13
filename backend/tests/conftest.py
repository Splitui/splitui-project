from datetime import datetime
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from app.db.database import metadata
from app.db.dependencies import get_connection
from app.main import app
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
    meetings_table = metadata.tables["meetings"]
    participants_table = metadata.tables["participants"]

    def _create_meeting(
            title="Тестовая Встреча",
            start_date: datetime = future_date(),
            creator_nickname="Тестовый создатель"
    ):
        meeting_uuid = str(uuid4())
        with db_engine.begin() as connection:
            result = connection.execute(
                meetings_table.insert().values(
                    uuid=meeting_uuid,
                    title=title,
                    start_date=start_date
                )
            )
            meeting_id = result.inserted_primary_key[0]

            connection.execute(
                participants_table.insert().values(
                    meeting_id=meeting_id,
                    nickname=creator_nickname,
                    is_creator=True
                )
            )

        return {
            "id": meeting_id,
            "uuid": meeting_uuid,
            "title": title,
            "start_date": start_date
        }

    return _create_meeting


@pytest.fixture
def create_participant(db_engine):
    participants_table = metadata.tables["participants"]

    def _create_participant(meeting_id, nickname="Тестовый участник", is_creator=False):
        with db_engine.begin() as connection:
            result = connection.execute(
                participants_table.insert().values(
                    meeting_id=meeting_id,
                    nickname=nickname,
                    is_creator=is_creator
                )
            )
            participant_id = result.inserted_primary_key[0]

        return {
            "id": participant_id,
            "meeting_id": meeting_id,
            "nickname": nickname,
            "is_creator": is_creator
        }

    return _create_participant
