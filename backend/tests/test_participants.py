from app.db.tables.meetings import MeetingStatus


def test_get_participants_includes_creator(app_client, create_meeting):
    meeting = create_meeting(creator_nickname="Тестовый создатель")

    response = app_client.get(
        f"/meetings/{meeting['uuid']}/participants?limit=10&offset=0",
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 200
    participants = response.json()
    assert participants[0]["nickname"] == "Тестовый создатель"
    assert bool(participants[0]["is_creator"]) == True


def test_add_participant_success(app_client, create_meeting):
    meeting = create_meeting()

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/participants",
        json={
            "nickname": "Тестовый участник",
        },
    )

    assert response.status_code == 201
    participant = response.json()
    assert participant["nickname"] == "Тестовый участник"
    assert bool(participant["is_creator"]) == False


def test_get_participants_returns_all_added_participants(app_client, create_meeting, create_participant):
    meeting = create_meeting()
    for i in range(10):
        create_participant(meeting_id=meeting["id"], nickname=f"Тестовый участник_{i}")

    response = app_client.get(
        (
            f"/meetings/{meeting['uuid']}/participants?limit=20&offset=0"
        ),
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 200
    assert len(response.json()) == 11


def test_get_participants_with_limit(app_client, create_meeting, create_participant):
    meeting = create_meeting()
    for i in range(5):
        create_participant(meeting_id=meeting["id"], nickname=f"Тестовый участник_{i}")

    response = app_client.get(
        (
            f"/meetings/{meeting['uuid']}/participants?limit=3&offset=0"
        ),
        headers={
            "session-id": meeting["creator_session_id"],
        },
    )

    assert response.status_code == 200
    assert len(response.json()) == 3


def test_add_participant_with_same_nickname(app_client, create_meeting, create_participant):
    meeting = create_meeting()
    create_participant(meeting_id=meeting["id"], nickname="Тестовый участник")

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/participants",
        json={"nickname": "Тестовый участник"},
    )

    assert response.status_code == 409
    assert response.json() == {
        "detail": "Участник с таким никнеймом уже добавлен"
    }


def test_cannot_add_participant_to_finished_meeting(app_client, create_meeting, change_meeting_status):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], MeetingStatus.FINISHED)

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/participants",
        json={"nickname": "Новый участник"}
    )

    assert response.status_code == 409


def test_cannot_update_participant_nickname_to_finished_meeting(
        app_client,
        create_meeting,
        create_participant,
        change_meeting_status
):
    meeting = create_meeting()
    participant = create_participant(meeting["id"])
    change_meeting_status(meeting["id"], MeetingStatus.FINISHED)

    response = app_client.patch(
        f"/meetings/{meeting['uuid']}/participants/me",
        headers={
            "session-id": participant["session_id"],
        },
        json={
            "nickname": "Новый участник",
        },
    )

    assert response.status_code == 409


def test_cannot_update_participant_bank_data_to_finished_meeting(
        app_client,
        create_meeting,
        create_participant,
        create_bank,
        change_meeting_status
):
    meeting = create_meeting()
    participant = create_participant(meeting["id"])
    bank = create_bank()
    change_meeting_status(meeting["id"], MeetingStatus.FINISHED)

    response = app_client.patch(
        f"/meetings/{meeting['uuid']}/participants/me",
        headers={
            "session-id": participant["session_id"],
        },
        json={
            "bank_id": bank["id"],
            "phone_number": "+7 (999) 123 45 67",
        },
    )

    assert response.status_code == 409
