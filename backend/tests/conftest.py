from datetime import datetime
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, update

from app.db.database import metadata
from app.db.dependencies import get_connection
from app.db.tables.meetings import MeetingStatus
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

@pytest.fixture
def create_receipt(db_engine):
    receipts_table = metadata.tables["receipts"]

    def _create_receipt(
        meeting_id,
        payer_id,
        title = "Тестовый чек",
        total_amount=1000,
        purchase_date = None,
        category = "Еда",
        comment= None,
        image_url= None,
        is_confirmed= False,
    ):

        values = {
            "meeting_id": meeting_id,
            "payer_id": payer_id,
            "title": title,
            "total_amount": total_amount,
            "category": category,
            "comment": comment,
            "image_url": image_url,
            "is_confirmed": is_confirmed,
        }

        if purchase_date is not None:
            values["purchase_date"] = purchase_date
        
        with db_engine.begin() as connection:
            result = connection.execute(
                receipts_table.insert().values(**values)
            )
            receipt_id = result.inserted_primary_key[0]

        return {
            "id": receipt_id,
            "payer_id": payer_id,
            "meeting_id": meeting_id,
        }

    return _create_receipt


@pytest.fixture
def create_receipt_item(db_engine):
    receipt_items_table = metadata.tables["receipt_items"]

    def _create_receipt_item(
        receipt_id,
        title = "Тестовая позиция",
        quantity = 1,
        unit_price=100,
    ):
        with db_engine.begin() as connection:
            result = connection.execute(
                receipt_items_table.insert().values(
                    receipt_id=receipt_id,
                    title=title,
                    quantity=quantity,
                    unit_price=unit_price,
                )
            )
            receipt_item_id = result.inserted_primary_key[0]

        return {
            "receipt_id": receipt_id,
            "id": receipt_item_id,
        }

    return _create_receipt_item


@pytest.fixture
def create_item_participant(db_engine):
    item_participants_table = metadata.tables[
        "receipt_item_participants"
    ]

    def _create_item_participant(
        receipt_item_id,
        participant_id,
        share_amount,
    ):
        with db_engine.begin() as connection:
            connection.execute(
                item_participants_table.insert().values(
                    receipt_item_id=receipt_item_id,
                    participant_id=participant_id,
                    share_amount=share_amount,
                )
            )

        return {
            "receipt_item_id": receipt_item_id,
            "participant_id": participant_id,
        }

    return _create_item_participant


@pytest.fixture
def create_meeting_with_participants(
    create_meeting,
    create_participant,
):
    def _create_meeting_with_participants(
        meeting_title: str = "Тестовая встреча",
        creator_nickname: str = "Создатель",
        payer_nickname: str = "Плательщик",
        participant_names: list[str] | None = None,
    ):
        if participant_names is None:
            participant_names = [
                "Первый участник",
                "Второй участник",
            ]

        meeting = create_meeting(
            title=meeting_title,
            creator_nickname=creator_nickname,
        )

        payer = create_participant(
            meeting_id=meeting["id"],
            nickname=payer_nickname,
        )

        participants = [
            create_participant(
                meeting_id=meeting["id"],
                nickname=nickname,
            )
            for nickname in participant_names
        ]

        return {
            "meeting": meeting,
            "payer": payer,
            "participants": participants,
        }

    return _create_meeting_with_participants

@pytest.fixture
def create_bank(db_engine):
    banks_table = metadata.tables["banks"]

    def _create_bank():
        with db_engine.begin() as connection:
            result = connection.execute(
                banks_table.insert().values(
                    name="Сбербанк"
                )
            )
            bank_id = result.inserted_primary_key[0]

        return {
            "id": bank_id,
        }

    return _create_bank


@pytest.fixture
def change_meeting_status(db_engine):
    meetings_table = metadata.tables["meetings"]

    def _change_meeting_status(meeting_id, status: MeetingStatus):
        with db_engine.begin() as connection:
            stmt = (
                update(meetings_table)
                .where(meetings_table.c.id == meeting_id)
                .values(status=status)
            )
            connection.execute(stmt)

    return _change_meeting_status
