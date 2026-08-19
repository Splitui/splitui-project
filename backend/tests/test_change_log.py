import pytest

from tests.test_receipts import make_receipt_payload
from app.db.tables.meetings import MeetingStatus
from datetime import UTC, datetime, timedelta

def test_meeting_created_change_log(
    app_client,
    get_change_logs,
):      

    start_date = (
        datetime.now(tz=UTC) + timedelta(days=1)
    ).isoformat()

    response = app_client.post(
        "/meetings",
        json={
            "title": "Новая встреча",
            "start_date": start_date,
            "creator_nickname": "Вова",
        },
    )

    meeting = response.json()
    creator = meeting["meeting_creator"]

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "meeting.created"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] == creator["id"]
    assert change["value"] == {
        "message": "Вова создал встречу «Новая встреча»",
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": meeting["id"],
            "participant_id": creator["id"],
            "title": "Новая встреча",
        },
    }


def test_meeting_updated_change_log(
    app_client,
    create_meeting,
    get_change_logs,
):
    meeting = create_meeting(title="Старое название")

    response = app_client.patch(
        f"/meetings/{meeting['uuid']}",
        json={"title": "Новое название"},
    )

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "meeting.updated"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] is None
    assert change["value"] == {
        "message": "Встреча «Новое название» изменена",
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": meeting["id"],
            "title": "Новое название",
        },
    }

def test_participant_created_change_log(
    app_client,
    create_meeting,
    get_change_logs,
):
    meeting = create_meeting()

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/participants",
        json={"nickname": "Петя"},
    )

    participant = response.json()

    changes = get_change_logs(meeting["id"])

    assert len(changes) == 1

    change = changes[0]

    assert change["action"] == "participant.created"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] == participant["id"]
    assert change["value"] == {
        "message": "Петя присоединился к встрече",
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": participant["id"],
            "participant_id": participant["id"],
            "nickname": "Петя",
        },
    }

def test_participant_updated_change_log(
    app_client,
    create_meeting,
    create_participant,
    get_change_logs,
):
    meeting = create_meeting()
    participant = create_participant(
        meeting_id=meeting["id"],
        nickname="Старое имя",
    )

    response = app_client.patch(
        (
            f"/meetings/{meeting['uuid']}/participants/{participant['id']}"
        ),
        json={"nickname": "Вася"},
    )


    changes = get_change_logs(meeting["id"])

    assert len(changes) == 1

    change = changes[0]

    assert change["action"] == "participant.updated"
    assert change["participant_id"] == participant["id"]
    assert change["value"]["message"] == (
        "Вася изменил данные участника"
    )
    assert change["value"]["context"] == {
        "meeting_id": meeting["id"],
        "entity_id": participant["id"],
        "participant_id": participant["id"],
        "nickname": "Вася",
    }

def test_receipt_created_change_log(
    app_client,
    create_meeting_with_participants,
    get_change_logs,
):
    data = create_meeting_with_participants()
    meeting = data["meeting"]
    payer = data["payer"]
    participant = data["participants"][0]

    payload = make_receipt_payload(
        payer["id"],
        [participant["id"]],
    )
    payload["title"] = "Ужин"
    payload["total_amount"] = 1200
    payload["items"] = None

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    receipt = response.json()["receipt"]

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "receipt.created"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] == payer["id"]
    assert change["value"] == {
        "message": f"{payer['nickname']} добавил чек «Ужин»",
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": receipt["id"],
            "title": "Ужин",
        },
    }


def test_receipt_updated_change_log(
    app_client,
    create_meeting_with_participants,
    create_receipt,
    get_change_logs,
):
    data = create_meeting_with_participants()
    meeting = data["meeting"]
    payer = data["payer"]
    participant = data["participants"][0]

    receipt = create_receipt(
        meeting_id=meeting["id"],
        payer_id=payer["id"],
        title="Старый чек",
    )

    payload = make_receipt_payload(
        payer["id"],
        [participant["id"]],
    )
    payload["id"] = receipt["id"]
    payload["title"] = "Обновлённый чек"
    payload["total_amount"] = 1500
    payload["items"] = None

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    assert response.status_code == 200

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "receipt.updated"
    assert change["participant_id"] == payer["id"]
    assert change["value"] == {
        "message": (
            f"{payer['nickname']} изменил чек "
            "«Обновлённый чек»"
        ),
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": receipt["id"],
            "title": "Обновлённый чек",
        },
    }

def test_receipt_deleted_change_log(
    app_client,
    create_meeting_with_participants,
    create_receipt,
    get_change_logs,
):
    data = create_meeting_with_participants()
    meeting = data["meeting"]
    payer = data["payer"]

    receipt = create_receipt(
        meeting_id=meeting["id"],
        payer_id=payer["id"],
        title="Удаляемый чек",
    )

    response = app_client.delete(
        (
            f"/meetings/{meeting['uuid']}/participant/{payer['id']}/receipts/{receipt['id']}"
        ),
    )

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "receipt.deleted"
    assert change["participant_id"] == payer["id"]
    assert change["value"] == {
        "message": (
            f"{payer['nickname']} удалил чек "
            "«Удаляемый чек»"
        ),
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": receipt["id"],
            "title": "Удаляемый чек",
        },
    }

def test_debts_recalculated_change_log(
    app_client,
    create_meeting,
    get_change_logs,
):
    meeting = create_meeting()

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/debts",
    )

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "debts.recalculated"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] is None
    assert change["value"] == {
        "message": "Долги встречи пересчитаны",
        "context": {
            "debts_count": 0,
        },
    }


def test_meeting_calculating_change_log(
    app_client,
    create_meeting,
    get_change_logs,
):
    meeting = create_meeting(title="Поход в ресторан")

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/calculate",
    )

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "meeting.calculating"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] is None
    assert change["value"] == {
        "message": (
            "Встреча «Поход в ресторан» переведена к расчётам"
        ),
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": meeting["id"],
            "title": "Поход в ресторан",
            "status": "В расчёте",
        },
    }

def test_meeting_finished_change_log(
    app_client,
    create_meeting,
    change_meeting_status,
    get_change_logs,
):
    meeting = create_meeting(title="Поход в ресторан")

    change_meeting_status(
        meeting["id"],
        "В расчёте",
    )

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/finish",
    )

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "meeting.finished"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] is None
    assert change["value"] == {
        "message": "Встреча «Поход в ресторан» завершена",
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": meeting["id"],
            "title": "Поход в ресторан",
            "status": "Завершена",
        },
    }

def test_meeting_editing_change_log(
    app_client,
    create_meeting,
    change_meeting_status,
    get_change_logs,
):
    meeting = create_meeting(title="Поход в ресторан")

    change_meeting_status(
        meeting["id"],
        "В расчёте",
    )

    response = app_client.post(
        f"/meetings/{meeting['uuid']}/edit",
    )

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "meeting.editing"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] is None
    assert change["value"] == {
        "message": (
            "Встреча «Поход в ресторан» "
            "возвращена к редактированию"
        ),
        "context": {
            "meeting_id": meeting["id"],
            "entity_id": meeting["id"],
            "title": "Поход в ресторан",
            "status": "Корректировка",
        },
    }

def test_bank_data_updated_change_log(
    app_client,
    create_meeting,
    create_participant,
    create_bank,
    get_change_logs,
):
    meeting = create_meeting()
    participant = create_participant(
        meeting_id=meeting["id"],
        nickname="Вова",
    )
    bank = create_bank()

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}/participants/"
            f"{participant['id']}/bank_data"
        ),
        json={
            "bank_id": bank["id"],
            "card_number": "2200 7000 1234 5678",
        },
    )

    change = get_change_logs(meeting["id"])[0]

    assert change["action"] == "bank_data.updated"
    assert change["meeting_id"] == meeting["id"]
    assert change["participant_id"] == participant["id"]
    assert change["value"] == {
        "message": "Вова изменил банковские реквизиты",
        "context": {
            "participant_id": participant["id"],
        },
    }