from uuid import uuid4

import pytest

from app.services.meetings_service import *
from app.services.participants_service import *
from app.services.receipts_service import *


@pytest.fixture
def test_meetings(test_app_client):
    meeting_response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая встреча",
            "meeting_date": "2026-08-10T12:00:00",
            "creator_nickname": "Создатель",
        },
    )

    meeting = meeting_response.json()
    meeting_uuid = meeting["uuid"]

    participant_response = test_app_client.post(
        f"/{meeting_uuid}/participants",
        json={
            "nickname": "Анна",
        },
    )

    participant = participant_response.json()

    receipt_response = test_app_client.post(
        f"meetings/{meeting_uuid}/receipts",
        json={
            "payer_id": participant["id"],
            "title": "Тестовый чек",
            "category": "Еда",
            "comment": "Чек для тестирования позиций",
            "is_confirmed": False,
        },
    )

    receipt = receipt_response.json()

    return {
        "meeting": meeting,
        "participant": participant,
        "receipt": receipt,
    }

def test_create_receipts(test_app_client,test_meetings):

    receipt_id = test_meetings["receipt"]["id"]
    
    response = test_app_client.post(
        f"/receipts/{receipt_id}/items",
        json={
            "title": "Пицца",
            "quantity": 2,
            "unit_price": "500.00",
        },
    )

    assert response.status_code == 201

    result = response.json()

    assert result["item"]["receipt_id"] == receipt_id
    assert result["item"]["title"] == "Пицца"
    assert result["item"]["quantity"] == 2
    assert result["item"]["amount"] == 1000
    assert result["total_amount"] == 1000

    meeting_uuid = test_meetings["meeting"]["uuid"]

    response = test_app_client.get(
        f"/meetings/{meeting_uuid}/receipts?limit=1&offset=0"
    )

    receipt = response.json()[0]

    assert receipt["total_amount"] == 1000


