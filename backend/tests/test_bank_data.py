def test_add_bank_data_with_card(
        app_client,
        create_meeting,
        create_participant,
        create_bank,
):
    meeting = create_meeting()
    participant = create_participant(meeting["id"])
    bank = create_bank()

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/bank_data",
        headers={
            "session-id": participant["session_id"],
        },
        json={
            "bank_id": bank["id"],
            "card_number": "2200 7000 1234 5678",
        },
    )

    assert response.status_code == 201
    bank_data = response.json()
    assert bank_data["participant_id"] == participant["id"]
    assert bank_data["bank_id"] == bank["id"]
    assert bank_data["card_number"] == "2200700012345678"
    assert bank_data["phone_number"] is None


def test_add_bank_data_with_phone(
        app_client,
        create_meeting,
        create_participant,
        create_bank,
):
    meeting = create_meeting()
    participant = create_participant(meeting["id"])
    bank = create_bank()

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/bank_data",
        headers={
            "session-id": participant["session_id"],
        },
        json={
            "bank_id": bank["id"],
            "phone_number": "+7 (999) 123 45 67",
        },
    )

    assert response.status_code == 201
    bank_data = response.json()
    assert bank_data["participant_id"] == participant["id"]
    assert bank_data["bank_id"] == bank["id"]
    assert bank_data["phone_number"] == "+79991234567"
    assert bank_data["card_number"] is None


def test_add_bank_data_with_phone_and_card(
        app_client,
        create_meeting,
        create_participant,
        create_bank,
):
    meeting = create_meeting()
    participant = create_participant(meeting["id"])
    bank = create_bank()

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/bank_data",
        headers={
            "session-id": participant["session_id"],
        },
        json={
            "bank_id": bank["id"],
            "card_number": "2200 7000 1234 5678",
            "phone_number": "+7 (999) 123 45 67",
        },
    )

    assert response.status_code == 201
    bank_data = response.json()
    assert bank_data["participant_id"] == participant["id"]
    assert bank_data["bank_id"] == bank["id"]
    assert bank_data["card_number"] == "2200700012345678"
    assert bank_data["phone_number"] == "+79991234567"


def test_cannot_add_bank_data_without_card_or_phone(
        app_client,
        create_meeting,
        create_participant,
        create_bank,
):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])
    bank = create_bank()

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/bank_data",
        headers={
            "session-id": participant["session_id"],
        },
        json={
            "bank_id": bank["id"],
        },
    )

    assert response.status_code == 422


def test_cannot_add_bank_data_for_participant_from_another_meeting(
        app_client,
        create_meeting,
        create_participant,
        create_bank
):
    first_meeting = create_meeting()
    second_meeting = create_meeting()
    participant = create_participant(meeting_id=second_meeting["id"])
    bank = create_bank()

    response = app_client.post(
        f"/meetings/{first_meeting['uuid']}/bank_data",
        headers={
            "session-id": participant["session_id"],
        },
        json={
            "bank_id": bank["id"],
            "card_number": "2200700012345678",
        },
    )

    assert response.status_code == 403
