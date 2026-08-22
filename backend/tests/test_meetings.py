import uuid
from datetime import datetime, timedelta, UTC

import pytest

from app.db.tables.meetings import MeetingStatus
from app.repositories.participants_repository import hash_token
from tests.conftest import change_meeting_status
from tests.utils import future_date


def test_create_meeting_with_valid_data(app_client):
    start_date = future_date()
    payload = {
        "title": "Тестовая Встреча",
        "start_date": start_date.isoformat(),
        "creator_nickname": "Тестовый участник",
    }

    response = app_client.post("/meetings", json=payload)

    assert response.status_code == 201
    meeting = response.json()
    assert meeting["title"] == "Тестовая Встреча"
    assert meeting["start_date"] == start_date.isoformat()


@pytest.mark.parametrize(
    "payload",
    [
        pytest.param(
            {
                "title": "Тестовая Встреча" * 100,
                "start_date": future_date().isoformat(),
                "creator_nickname": "Тестовый участник",
            },
            id="title_too_long",
        ),
        pytest.param(
            {
                "title": "Тестовая Встреча",
                "start_date": "2026/08/08",
                "creator_nickname": "Тестовый участник",
            },
            id="invalid_start_date",
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

    response = app_client.get(
        f"/meetings/{meeting_uuid}",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["uuid"] == meeting_uuid
    assert body["title"] == "Тестовая Встреча"


def test_get_meeting_with_non_existent_uuid(app_client):
    missing_uuid = str(uuid.uuid4())
    session_id = str(uuid.uuid4())

    response = app_client.get(
        f"/meetings/{missing_uuid}",
        headers={
            "session-id": hash_token(session_id),
        },
    )

    assert response.status_code == 404


def test_create_meeting_with_past_date_fails(app_client):
    past_date = datetime.now(UTC) - timedelta(days=5)
    payload = {
        "title": "Тестовая Встреча",
        "start_date": past_date.isoformat(),
        "creator_nickname": "Тестовый участник",
    }

    response = app_client.post("/meetings", json=payload)

    assert response.status_code == 422


def test_calculate_meeting_from_active_success(app_client, create_meeting):
    meeting = create_meeting()

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/calculate",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == MeetingStatus.CALCULATING


def test_calculate_meeting_from_editing_success(app_client, create_meeting, change_meeting_status):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], MeetingStatus.EDITING)

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/calculate",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == MeetingStatus.CALCULATING


@pytest.mark.parametrize(
    "status",
    [MeetingStatus.CALCULATING, MeetingStatus.FINISHED],
)
def test_calculate_meeting_from_invalid_status_fails(app_client, create_meeting, change_meeting_status, status):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], status)

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/calculate",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 409


def test_finish_meeting_from_calculate_success(app_client, create_meeting, change_meeting_status):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], MeetingStatus.CALCULATING)

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/finish",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == MeetingStatus.FINISHED


@pytest.mark.parametrize(
    "status",
    [MeetingStatus.ACTIVE, MeetingStatus.EDITING, MeetingStatus.FINISHED],
)
def test_finish_meeting_from_invalid_status_fails(app_client, create_meeting, change_meeting_status, status):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], status)

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/finish",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 409


def test_edit_meeting_from_calculating_success(app_client, create_meeting, change_meeting_status):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], MeetingStatus.CALCULATING)

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/edit",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == MeetingStatus.EDITING


@pytest.mark.parametrize(
    "status",
    [MeetingStatus.ACTIVE, MeetingStatus.EDITING, MeetingStatus.FINISHED],
)
def test_edit_meeting_from_invalid_status_fails(app_client, create_meeting, change_meeting_status, status):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], status)

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/edit",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 409
