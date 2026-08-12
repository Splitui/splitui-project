import uuid
from datetime import datetime, timedelta

import pytest

from tests.utils import future_date


def test_create_meeting_with_valid_data(app_client):
    meeting_date = future_date()
    payload = {
        "title": "Тестовая Встреча",
        "meeting_date": meeting_date.isoformat(),
        "creator_nickname": "Тестовый участник",
    }

    response = app_client.post("/meetings", json=payload)

    assert response.status_code == 201
    meeting = response.json()
    assert meeting["title"] == "Тестовая Встреча"
    assert meeting["start_date"] == meeting_date.isoformat()


@pytest.mark.parametrize(
    "payload",
    [
        pytest.param(
            {
                "title": "Тестовая Встреча" * 100,
                "meeting_date": future_date().isoformat(),
                "creator_nickname": "Тестовый участник",
            },
            id="title_too_long",
        ),
        pytest.param(
            {
                "title": "Тестовая Встреча",
                "meeting_date": "2026/08/08",
                "creator_nickname": "Тестовый участник",
            },
            id="invalid_meeting_date",
        ),
        pytest.param(
            {
                "title": "Тестовая Встреча"
            },
            id="missing_required_fields"
        ),
    ],
)
def test_create_meeting_with_invalid_data(app_client, payload):
    response = app_client.post("/meetings", json=payload)

    assert response.status_code == 422


def test_get_meetings_empty(app_client):
    response = app_client.get("/meetings?limit=20&offset=0")

    assert response.status_code == 200
    assert response.json() == []


def test_get_meetings_returns_created_meeting(app_client, create_meeting):
    create_meeting(title="Тестовая Встреча")

    response = app_client.get("/meetings?limit=20&offset=0")

    assert response.status_code == 200
    meetings = response.json()
    assert len(meetings) == 1
    assert meetings[0]["title"] == "Тестовая Встреча"


def test_get_meetings_with_limit(app_client, create_meeting):
    for i in range(5):
        create_meeting(title=f"Тестовая Встреча_{i}")

    response = app_client.get("/meetings?limit=3&offset=0")

    assert response.status_code == 200
    assert len(response.json()) == 3


def test_get_meetings_total_count_without_limit(app_client, create_meeting):
    for i in range(5):
        create_meeting(title=f"Тестовая Встреча {i}")

    response = app_client.get("/meetings?limit=20&offset=0")

    assert response.status_code == 200
    assert len(response.json()) == 5


def test_get_meeting_by_uuid_success(app_client, create_meeting):
    meeting = create_meeting(title="Тестовая Встреча")
    meeting_uuid = meeting['uuid']

    response = app_client.get(f"/meetings/{meeting_uuid}")

    assert response.status_code == 200
    body = response.json()
    assert body["uuid"] == meeting_uuid
    assert body["title"] == "Тестовая Встреча"


def test_get_meeting_with_non_existent_uuid(app_client):
    missing_uuid = str(uuid.uuid4())

    response = app_client.get(f"/meetings/{missing_uuid}")

    assert response.status_code == 404
