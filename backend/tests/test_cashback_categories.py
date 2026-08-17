import pytest

from app.db.tables.meetings import MeetingStatus


def test_get_cashback_categories_empty(app_client, create_meeting, create_participant):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])

    response = app_client.get(f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories")

    assert response.status_code == 200
    assert response.json() == []


def test_get_cashback_categories_returns_configured(
        app_client, create_meeting, create_participant, create_cashback_category, create_participant_cashback
):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])
    category = create_cashback_category(name="Супермаркеты")
    create_participant_cashback(
        participant_id=participant["id"], category_id=category["id"], percent=5
    )

    response = app_client.get(f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories")

    assert response.status_code == 200
    categories = response.json()
    assert len(categories) == 1
    assert categories[0]["category_id"] == category["id"]
    assert float(categories[0]["percent"]) == 5


def test_update_cashback_categories_creates_new(
        app_client, create_meeting, create_participant, create_cashback_category
):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])
    category = create_cashback_category(name="АЗС")
    payload = {
        "categories":
            [
                {"category_id": category["id"], "percent": 4}
            ]
    }

    response = app_client.put(
        f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories", json=payload
    )

    assert response.status_code == 200
    categories = response.json()
    assert len(categories) == 1
    assert float(categories[0]["percent"]) == 4


def test_update_cashback_categories_replaces_existing(
        app_client, create_meeting, create_participant, create_cashback_category, create_participant_cashback
):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])
    category_1 = create_cashback_category(name="Супермаркеты")
    category_2 = create_cashback_category(name="Транспорт")
    create_participant_cashback(participant["id"], category_1["id"], 5)
    create_participant_cashback(participant["id"], category_2["id"], 3)
    payload = {
        "categories":
            [
                {"category_id": category_1["id"], "percent": 7}
            ]
    }

    response = app_client.put(
        f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories", json=payload
    )

    assert response.status_code == 200
    categories = response.json()
    assert len(categories) == 1
    assert categories[0]["category_id"] == category_1["id"]
    assert float(categories[0]["percent"]) == 7


def test_update_cashback_categories_zero_percent_removed(
        app_client, create_meeting, create_participant, create_cashback_category, create_participant_cashback
):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])
    category = create_cashback_category(name="Развлечения")
    create_participant_cashback(participant["id"], category["id"], 5)
    payload = {
        "categories":
            [
                {"category_id": category["id"], "percent": 0}
            ]
    }

    response = app_client.put(
        f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories", json=payload
    )

    assert response.status_code == 200
    assert response.json() == []


def test_update_cashback_categories_unknown_category_fails(
        app_client, create_meeting, create_participant
):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])
    payload = {
        "categories":
            [
                {"category_id": 9999, "percent": 5}
            ]
    }

    response = app_client.put(
        f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories", json=payload
    )

    assert response.status_code == 422


def test_update_cashback_categories_duplicate_category_fails(
        app_client, create_meeting, create_participant, create_cashback_category
):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])
    category = create_cashback_category(name="АЗС")
    payload = {
        "categories": [
            {"category_id": category["id"], "percent": 5},
            {"category_id": category["id"], "percent": 3},
        ]
    }

    response = app_client.put(
        f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories", json=payload
    )

    assert response.status_code == 422


@pytest.mark.parametrize("percent", [-1, 101])
def test_update_cashback_categories_percent_out_of_range_fails(
        app_client, create_meeting, create_participant, create_cashback_category, percent
):
    meeting = create_meeting()
    participant = create_participant(meeting_id=meeting["id"])
    category = create_cashback_category(name="АЗС")
    payload = {
        "categories":
            [
                {"category_id": category["id"], "percent": percent}
            ]
    }

    response = app_client.put(
        f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories", json=payload
    )

    assert response.status_code == 422


def test_get_best_cashback_sorted_by_percent_desc(
        app_client, create_meeting, create_participant, create_cashback_category, create_participant_cashback
):
    meeting = create_meeting()
    participant_1 = create_participant(meeting_id=meeting["id"], nickname="Оксана")
    participant_2 = create_participant(meeting_id=meeting["id"], nickname="Олег")
    participant_3 = create_participant(meeting_id=meeting["id"], nickname="Настя")
    category = create_cashback_category(name="Супермаркеты")

    create_participant_cashback(participant_1["id"], category["id"], 2)
    create_participant_cashback(participant_2["id"], category["id"], 4)
    create_participant_cashback(participant_3["id"], category["id"], 5)

    response = app_client.get(f"/meetings/{meeting['uuid']}/cashback-categories/{category['id']}")

    assert response.status_code == 200
    results = response.json()
    assert [r["nickname"] for r in results] == ["Настя", "Олег", "Оксана"]


@pytest.mark.parametrize("status", [MeetingStatus.ACTIVE, MeetingStatus.EDITING])
def test_update_cashback_categories_with_valid_status_meeting(
        app_client,
        create_meeting,
        create_participant,
        change_meeting_status,
        status,
        create_cashback_category
):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], status)
    participant = create_participant(meeting_id=meeting["id"])
    category = create_cashback_category(name="Рестораны")
    payload = {
        "categories":
            [
                {"category_id": category["id"], "percent": 5}
            ]
    }

    response = app_client.put(
        f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories", json=payload
    )

    assert response.status_code == 200


@pytest.mark.parametrize("status", [MeetingStatus.CALCULATING, MeetingStatus.FINISHED])
def test_cannot_update_cashback_categories_with_invalid_status_meeting(
        app_client,
        create_meeting,
        create_participant,
        change_meeting_status,
        status,
        create_cashback_category
):
    meeting = create_meeting()
    change_meeting_status(meeting["id"], status)
    participant = create_participant(meeting_id=meeting["id"])
    category = create_cashback_category(name="Рестораны")
    payload = {
        "categories":
            [
                {"category_id": category["id"], "percent": 5}
            ]
    }

    response = app_client.put(
        f"/meetings/{meeting['uuid']}/participants/{participant['id']}/cashback-categories", json=payload
    )

    assert response.status_code == 409
