from uuid import uuid4

from app.services.meetings_service import *
from app.services.participants_service import *
from app.services.receipts_service import *


def test_create_receipts(test_app_client):
    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая Встреча",
            "meeting_date": "2026-08-08T12:25:47",
            "creator_nickname": "Тестовый участник",
        },
    )

    meeting_uuid = response.json()["uuid"]
    meeting_id = response.json()["id"]
    
    response = test_app_client.post(
        f"{meeting_uuid}/participants",
        json={"nickname": "Анна"},
    )

    participant_payer = response.json()

    response = test_app_client.post(
        f"/meetings/{meeting_uuid}/receipts",
        json={
            "payer_id": participant_payer["id"],
            "title": "Ресторан",
            "category": "Еда",
            "comment": "Общий ужин",
            "is_confirmed": False,
        },
    )

    assert response.status_code == 201

    receipt = response.json()

    assert receipt["meeting_id"] == meeting_id
    assert receipt["payer_id"] == participant_payer["id"]
    assert receipt["title"] == "Ресторан"
    assert receipt["category"] == "Еда"
    assert receipt["comment"] == "Общий ужин"
    assert receipt["image_url"] is None
    assert receipt["is_confirmed"] is not None

    response = test_app_client.post(
            f"/meetings/{uuid4}/receipts",
            json={
                "payer_id": participant_payer["id"],
                "title": "Ресторан",
                "category": "Еда",
                "comment": "Общий ужин",
                "is_confirmed": False,
            },
        )

    assert response.status_code == 404


def test_get_receipts(test_app_client):
    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая Встреча",
            "meeting_date": "2026-08-08T12:25:47",
            "creator_nickname": "Тестовый участник",
        },
    )

    meeting_uuid = response.json()["uuid"]

    response = test_app_client.get(
        f"/meetings/{meeting_uuid}/receipts?limit=5&offset=0"
    )

    assert response.status_code == 200
    assert response.json() == []


    response = test_app_client.post(
        f"{meeting_uuid}/participants",
        json={"nickname": "Анна"},
    )

    participant_payer = response.json()


    for i in range(10):
        test_app_client.post(
            f"/meetings/{meeting_uuid}/receipts",
            json={
                "payer_id": participant_payer["id"],
                "title": f"Ресторан {i}",
                "category": "Еда",
                "comment": "Общий ужин",
                "is_confirmed": False,
            },
        )

    response = test_app_client.get(
        f"/meetings/{meeting_uuid}/receipts?limit=10&offset=0"
    )

    assert response.status_code == 200
    assert len(response.json()) == 10

    response = test_app_client.get(
        f"/meetings/{meeting_uuid}/receipts?limit=5&offset=0"
    )

    assert response.status_code == 200
    assert len(response.json()) == 5

    response = test_app_client.get(
        f"/meetings/{uuid4}/receipts"
    )

    assert response.status_code == 404

def test_two_meetings_receipts(test_app_client):
    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Ресторан 1",
            "meeting_date": "2026-08-08T12:25:47",
            "creator_nickname": "Тестовый участник",
        },
    )

    first_meeting_uuid = response.json()["uuid"]

    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Ресторан 2",
            "meeting_date": "2026-08-08T12:25:47",
            "creator_nickname": "Тестовый участник",
        },
    )

    second_meeting_uuid = response.json()["uuid"]

    response = test_app_client.post(
        f"{first_meeting_uuid}/participants",
        json={"nickname": "Анна1"},
    )

    first_payer = response.json()

    response = test_app_client.post(
        f"{second_meeting_uuid}/participants",
        json={"nickname": "Анна2"},
    )

    second_payer = response.json()

    test_app_client.post(
        f"/meetings/{first_meeting_uuid}/receipts",
        json={
            "payer_id": first_payer["id"],
            "title": "Чек первой встречи",
        },
    )

    test_app_client.post(
        f"/meetings/{second_meeting_uuid}/receipts",
        json={
            "payer_id": first_payer["id"],
            "title": "Чек второй встречи",
        },
    )


    response = test_app_client.get(
        f"/meetings/{first_meeting_uuid}/receipts?limit=10&offset=0"
    )

    first_meeting_receipt = response.json()

    response = test_app_client.get(
        f"/meetings/{second_meeting_uuid}/receipts?limit=10&offset=0"
    )

    second_meeting_receipt = response.json()

    assert [r["title"] for r in first_meeting_receipt] == [
        "Чек первой встречи"
    ]

    assert [r["title"] for r in second_meeting_receipt] == [
        "Чек второй встречи"
    ]

def test_valid_data(test_app_client):
    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая встреча",
            "meeting_date": "2026-08-08T12:25:47",
            "creator_nickname": "Тестовый участник",
        },
    )

    meeting_uuid = response.json()["uuid"]

    response = test_app_client.post(
        f"/meetings/{meeting_uuid}/receipts",
        json={
            "payer_id": 1,
        },
    )

    assert response.status_code == 422

    response = test_app_client.post(
        f"/meetings/{meeting_uuid}/receipts",
        json={
            "payer_id": 1,
            "title": "sixseven" * 67
        },
    )

    assert response.status_code == 422

    response = test_app_client.post(
        f"/meetings/{meeting_uuid}/receipts",
        json={
            "payer_id": 1,
            "title": "sixseven",
            "category": "a" * 67,
        },
    )

    assert response.status_code == 422

    response = test_app_client.post(
        f"/meetings/{meeting_uuid}/receipts",
        json={
            "payer_id": "sixsix",
            "title": "sixseven",
        },
    )

    assert response.status_code == 422
