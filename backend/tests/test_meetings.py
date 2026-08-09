from uuid import uuid4

from app.services.meetings_service import *


def test_create_meetings(test_app_client):
    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая Встреча",
            "meeting_date": "2026-08-08T12:25:47",
            "creator_nickname": "Тестовый участник",
        },
    )

    meeting = response.json()

    assert response.status_code == 201
    assert meeting["title"] == "Тестовая Встреча"
    assert meeting["uuid"] is not None


def test_get_meetings(test_app_client):
    response = test_app_client.get("/meetings")

    assert response.json() == []

    response = test_app_client.post(
            "/meetings",
            json={
                "title": "Тестовая Встреча",
                "meeting_date": "2026-08-08T12:25:47",
                "creator_nickname": "Тестовый участник",
            },
        )

    response = test_app_client.get("/meetings")

    meetings = response.json()

    assert response.status_code == 200
    assert meetings[0]["title"] == "Тестовая Встреча"

    for i in range(10):
        test_app_client.post(
            "/meetings",
            json={
                "title": f"Тестовая Встреча {i}",
                "meeting_date": "2026-08-08T12:25:47",
                "creator_nickname": f"Тестовый участник {i}",
            },
        )
    response = test_app_client.get("/meetings")


    assert len(response.json()) == 11

def test_get_meeting_by_uuid(test_app_client):
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
        f"/meetings/{meeting_uuid}"
    )

    assert response.status_code == 200

    meeting = response.json()

    assert meeting["uuid"] == meeting_uuid
    assert meeting["title"] == "Тестовая Встреча"

    response = test_app_client.get(f"/meetings/{uuid4}")

    assert response.status_code == 404


def test_valid_data(test_app_client):
    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая Встреча" * 100,
            "meeting_date": "2026-08-08T12:25:47",
            "creator_nickname": "Тестовый участник",
        },
    )

    assert response.status_code == 422

    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая Встреча",
            "meeting_date": "devyatUtra",
            "creator_nickname": "Тестовый участник",
        },
    )

    assert response.status_code == 422

    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая Встреча",
        },
    )

    assert response.status_code == 422

def test_add_and_get_participant(test_app_client):
    response = test_app_client.post(
        "/meetings",
        json={
            "title": "Тестовая Встреча",
            "meeting_date": "2026-08-08T12:25:47",
            "creator_nickname": "Тестовый участник",
        },
    )

    meeting_uuid = response.json()["uuid"]

    response = test_app_client.post(
        f"/meetings/{meeting_uuid}/participants",
        json={"nickname": "Анна"},
    )

    assert response.status_code == 200

    participant = response.json()

    assert participant["nickname"] == "Анна"
    assert participant["is_creator"] == False

    for i in range(10):
        test_app_client.post(
            f"/meetings/{meeting_uuid}/participants",
            json={"nickname": "7{i}6"},
        )

    response = test_app_client.get(
        f"/meetings/{meeting_uuid}/participants"
    )

    participants = response.json()

    assert response.status_code == 200
    assert len(participants) == 12
    assert participants[0]["nickname"] == "Тестовый участник"
    assert participants[0]["is_creator"] == True

    response = test_app_client.get(
        f"/meetings/{uuid4}/participants"
    )
    assert response.status_code == 404
