def test_get_participants_includes_creator(app_client, create_meeting):
    meeting = create_meeting(creator_nickname="Тестовый создатель")

    response = app_client.get(f"/{meeting['uuid']}/participants?limit=20&offset=0")

    assert response.status_code == 200
    participants = response.json()
    assert participants[0]["nickname"] == "Тестовый создатель"
    assert bool(participants[0]["is_creator"]) == True


def test_add_participant_success(app_client, create_meeting):
    meeting = create_meeting()

    response = app_client.post(
        f"/{meeting['uuid']}/participants",
        json={"nickname": "Тестовый участник"},
    )

    assert response.status_code == 201
    participant = response.json()
    assert participant["nickname"] == "Тестовый участник"
    assert bool(participant["is_creator"]) == False


def test_get_participants_returns_all_added_participants(app_client, create_meeting, create_participant):
    meeting = create_meeting()
    for i in range(10):
        create_participant(meeting_id=meeting["id"], nickname=f"Тестовый участник_{i}")

    response = app_client.get(f"{meeting['uuid']}/participants?limit=20&offset=0")

    assert response.status_code == 200
    assert len(response.json()) == 11


def test_get_participants_with_limit(app_client, create_meeting, create_participant):
    meeting = create_meeting()
    for i in range(5):
        create_participant(meeting_id=meeting["id"], nickname=f"Тестовый участник_{i}")

    response = app_client.get(f"{meeting['uuid']}/participants?limit=3&offset=0")

    assert response.status_code == 200
    assert len(response.json()) == 3
