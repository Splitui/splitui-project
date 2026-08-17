import pytest


def make_receipt_payload(payer_id, participant_ids):
    return {
        "id": None,
        "payer_id": payer_id,
        "title": "Тестовый чек",
        "purchase_date": "2026-08-14T20:00:00",
        "category": "Еда",
        "comment": "Тестовый комментарий",
        "image_url": None,
        "is_confirmed": False,
        "total_amount": None,
        "participants": [
            {"participant_id": participant_id}
            for participant_id in participant_ids
        ],
        "items": [],
    }

def test_create_receipt_with_one_item(
    app_client,
    create_meeting_with_participants,
):
    context = create_meeting_with_participants(
        participant_names=["Должник"],
    )

    meeting = context["meeting"]
    payer = context["payer"]
    participant = context["participants"][0]

    payload = make_receipt_payload(
        payer_id=payer["id"],
        participant_ids=[participant["id"]],
    )
    payload["items"] = [
        {
            "id": None,
            "title": "Пиво",
            "unit_price": 700,
            "quantity": 2,
            "participants": [
                {"participant_id": participant["id"]},
            ],
        },
    ]

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    assert response.status_code == 200

    result = response.json()
    receipt = result["receipt"]

    assert receipt["title"] == "Тестовый чек"
    assert receipt["payer_id"] == payer["id"]
    assert receipt["total_amount"] == 1400

    assert len(result["items"]) == 1

    item = result["items"][0]
    assert item["item"]["title"] == "Пиво"
    assert item["item"]["quantity"] == 2
    assert item["item"]["unit_price"] == 700

    assert len(item["participants"]) == 1
    assert item["participants"][0]["participant_id"] == participant["id"]
    assert item["participants"][0]["share_amount"] == 1400

    assert len(result["participant_amounts"]) == 1
    assert (
        result["participant_amounts"][0]["participant_id"]
        == participant["id"]
    )
    assert result["participant_amounts"][0]["amount"] == 1400

def test_create_receipt_with_multiple_items(
    app_client,
    create_meeting_with_participants,
):
    context = create_meeting_with_participants(
        participant_names=[
            "Первый участник",
            "Второй участник",
        ],
    )

    meeting = context["meeting"]
    payer = context["payer"]
    participant_one, participant_two = context["participants"]

    payload = make_receipt_payload(
        payer_id=payer["id"],
        participant_ids=[
            participant_one["id"],
            participant_two["id"],
        ],
    )
    payload["items"] = [
        {
            "id": None,
            "title": "Пиво",
            "unit_price": 1000,
            "quantity": 1,
            "participants": [
                {"participant_id": participant_one["id"]},
                {"participant_id": participant_two["id"]},
            ],
        },
        {
            "id": None,
            "title": "Кофе",
            "unit_price": 300,
            "quantity": 2,
            "participants": [
                {"participant_id": participant_one["id"]},
            ],
        },
    ]

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    assert response.status_code == 200

    result = response.json()

    assert result["receipt"]["total_amount"] == 1600
    assert len(result["items"]) == 2

    pivo = result["items"][0]
    coffee = result["items"][1]

    assert pivo["item"]["title"] == "Пиво"
    assert len(pivo["participants"]) == 2
    assert all(
        link["share_amount"] == 500
        for link in pivo["participants"]
    )

    assert coffee["item"]["title"] == "Кофе"
    assert len(coffee["participants"]) == 1
    assert coffee["participants"][0]["share_amount"] == 600

    amounts = {
        amount["participant_id"]: amount["amount"]
        for amount in result["participant_amounts"]
    }

    assert amounts[participant_one["id"]] == 1100
    assert amounts[participant_two["id"]] == 500
    assert payer["id"] not in amounts

def test_create_receipt_without_items(
    app_client,
    create_meeting_with_participants,
):
    context = create_meeting_with_participants(
        participant_names=["Участник"],
    )

    meeting = context["meeting"]
    payer = context["payer"]
    participant = context["participants"][0]

    payload = {
        "id": None,
        "payer_id": payer["id"],
        "title": "Общий чек",
        "purchase_date": "2026-08-14T20:00:00",
        "category": "Еда",
        "comment": None,
        "image_url": None,
        "is_confirmed": False,
        "total_amount": 900,
        "participants": [
            {
                "participant_id": participant["id"],
            },
        ],
        "items": None,
    }

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    assert response.status_code == 200

    result = response.json()

    assert result["receipt"]["total_amount"] == 900
    assert len(result["items"]) == 1

    fake_item = result["items"][0]

    assert fake_item["item"]["title"] == "Общая сумма"
    assert fake_item["item"]["quantity"] == 1
    assert fake_item["item"]["unit_price"] == 900
    assert fake_item["item"]["amount"] == 900

    assert len(fake_item["participants"]) == 1
    assert (
        fake_item["participants"][0]["participant_id"]
        == participant["id"]
    )
    assert (
        fake_item["participants"][0]["share_amount"]
        == 900
    )

    assert len(result["participant_amounts"]) == 1
    assert (
        result["participant_amounts"][0]["participant_id"]
        == participant["id"]
    )
    assert result["participant_amounts"][0]["amount"] == 900

def test_create_receipt_without_items_and_empty_participants(
    app_client,
    create_meeting_with_participants,
):
    context = create_meeting_with_participants(
        participant_names=["Участник"],
    )

    meeting = context["meeting"]
    payer = context["payer"]

    participants_response = app_client.get(
        f"/meetings/{meeting['uuid']}/participants?limit=20&offset=0"
    )

    assert participants_response.status_code == 200

    meeting_participants = participants_response.json()
    meeting_participant_ids = {
        item["id"]
        for item in meeting_participants
    }

    payload = {
        "id": None,
        "payer_id": payer["id"],
        "title": "Общий чек на всех",
        "purchase_date": "2026-08-14T20:00:00",
        "category": "Еда",
        "comment": None,
        "image_url": None,
        "is_confirmed": False,
        "total_amount": 900,
        "participants": [],
        "items": None,
    }

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    assert response.status_code == 200

    result = response.json()

    assert result["receipt"]["total_amount"] == 900
    assert len(result["items"]) == 1

    fake_item = result["items"][0]

    assert fake_item["item"]["title"] == "Общая сумма"
    assert fake_item["item"]["quantity"] == 1
    assert fake_item["item"]["unit_price"] == 900

    item_participant_ids = {
        link["participant_id"]
        for link in fake_item["participants"]
    }

    assert item_participant_ids == meeting_participant_ids

def test_create_item_with_empty_participants(
    app_client,
    create_meeting_with_participants,
):
    context = create_meeting_with_participants(
        participant_names=[
            "Первый участник",
            "Второй участник",
        ],
    )

    meeting = context["meeting"]
    payer = context["payer"]
    first_participant, second_participant = context["participants"]

    payload = make_receipt_payload(
        payer_id=payer["id"],
        participant_ids=[
            first_participant["id"],
            second_participant["id"],
        ],
    )
    payload["items"] = [
        {
            "id": None,
            "title": "Пиво",
            "unit_price": 1000,
            "quantity": 1,
            "participants": [],
        },
    ]

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    assert response.status_code == 200

    result = response.json()
    pivo = result["items"][0]

    assert len(pivo["participants"]) == 2

    links = {
        link["participant_id"]: float(link["share_amount"])
        for link in pivo["participants"]
    }

    assert links == {
        first_participant["id"]: 500,
        second_participant["id"]: 500,
    }

@pytest.mark.parametrize(
    "invalid_field",
    [
        "missing_payer_id",
        "invalid_payer_id",
        "zero_quantity",
        "negative_unit_price",
        "invalid_participant_id",
    ],
)
def test_create_receipt_with_invalid_data(
    app_client,
    create_meeting_with_participants,
    invalid_field,
):
    context = create_meeting_with_participants(
        participant_names=["Участник"],
    )

    meeting = context["meeting"]
    payer = context["payer"]
    participant = context["participants"][0]

    payload = make_receipt_payload(
        payer_id=payer["id"],
        participant_ids=[participant["id"]],
    )
    payload["items"] = [
        {
            "id": None,
            "title": "Пиво",
            "unit_price": 700,
            "quantity": 2,
            "participants": [
                {"participant_id": participant["id"]},
            ],
        },
    ]

    if invalid_field == "missing_payer_id":
        payload.pop("payer_id")
    elif invalid_field == "invalid_payer_id":
        payload["payer_id"] = 0
    elif invalid_field == "zero_quantity":
        payload["items"][0]["quantity"] = 0
    elif invalid_field == "negative_unit_price":
        payload["items"][0]["unit_price"] = -100
    elif invalid_field == "invalid_participant_id":
        payload["items"][0]["participants"] = [
            {"participant_id": 0},
        ]

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}"
            f"/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    assert response.status_code == 422

def test_get_full_receipt_with_items_and_participants(
    app_client,
    create_meeting_with_participants,
    create_receipt,
    create_receipt_item,
    create_item_participant,
):
    context = create_meeting_with_participants(
        meeting_title="Тестовая встреча",
        creator_nickname="Создатель",
        payer_nickname="Плательщик",
        participant_names=[
            "Первый участник",
            "Второй участник",
        ],
    )

    meeting = context["meeting"]
    payer = context["payer"]
    participant_one, participant_two = context["participants"]

    receipt = create_receipt(
        meeting_id=meeting["id"],
        payer_id=payer["id"],
        title="Ужин",
        total_amount=1600,
        category="Еда",
        comment="Тестовый чек",
        is_confirmed=True,
    )

    pivo = create_receipt_item(
        receipt_id=receipt["id"],
        title="Пиво",
        quantity=1,
        unit_price=1000,
    )

    create_item_participant(
        receipt_item_id=pivo["id"],
        participant_id=participant_one["id"],
        share_amount=500,
    )
    create_item_participant(
        receipt_item_id=pivo["id"],
        participant_id=participant_two["id"],
        share_amount=500,
    )

    coffee = create_receipt_item(
        receipt_id=receipt["id"],
        title="Кофе",
        quantity=2,
        unit_price=300,
    )

    create_item_participant(
        receipt_item_id=coffee["id"],
        participant_id=participant_one["id"],
        share_amount=600,
    )

    response = app_client.get(
        (
            f"/meetings/{meeting['uuid']}/receipts/{receipt['id']}?limit=20&offset=0"
        )
    )

    assert response.status_code == 200

    result = response.json()

    assert result["id"] == receipt["id"]
    assert result["meeting_id"] == meeting["id"]
    assert result["payer_id"] == payer["id"]
    assert result["title"] == "Ужин"
    assert result["category"] == "Еда"
    assert result["comment"] == "Тестовый чек"
    assert result["is_confirmed"]
    assert result["total_amount"] == 1600

    assert len(result["items"]) == 2

    items = {
        item["title"]: item
        for item in result["items"]
    }

    assert set(items) == {"Пиво", "Кофе"}

    pivo_response = items["Пиво"]

    assert pivo_response["id"] == pivo["id"]
    assert pivo_response["quantity"] == 1
    assert pivo_response["unit_price"] == 1000
    assert pivo_response["amount"] == 1000

    coffee_response = items["Кофе"]

    assert coffee_response["id"] == coffee["id"]
    assert coffee_response["quantity"] == 2
    assert coffee_response["unit_price"] == 300
    assert coffee_response["amount"] == 600

    pivo_participants = {
        participant["id"]: participant["share_amount"]
        for participant in pivo_response["participants"]
    }

    assert pivo_participants == {
        participant_one["id"]: 500,
        participant_two["id"]: 500,
    }

    coffee_participants = {
        participant["id"]: participant["share_amount"]
        for participant in coffee_response["participants"]
    }

    assert coffee_participants == {
        participant_one["id"]: 600,
    }

    participant_amounts = {
        participant["participant_id"]: participant["amount"]
        for participant in result["participant_amounts"]
    }

    assert participant_amounts == {
        participant_one["id"]: 1100,
        participant_two["id"]: 500,
    }

    assert payer["id"] not in participant_amounts


@pytest.mark.parametrize(
    "invalid_case",
    [
        "duplicate_item_participant",
        "duplicate_receipt_participant",
        "participant_from_another_meeting",
    ],
)
def test_create_receipt_with_invalid_participants(
    app_client,
    create_meeting_with_participants,
    invalid_case,
):
    context = create_meeting_with_participants(
        participant_names=["Участник"],
    )
    context_2 = create_meeting_with_participants(
        meeting_title="Другая встреча",
        participant_names=["Чужой участник"],
    )

    meeting = context["meeting"]
    payer = context["payer"]
    participant = context["participants"][0]
    foreign_participant = context_2["participants"][0]

    payload = make_receipt_payload(
        payer_id=payer["id"],
        participant_ids=[participant["id"]],
    )
    payload["items"] = [
        {
            "id": None,
            "title": "Пиво",
            "unit_price": 1000,
            "quantity": 1,
            "participants": [
                {
                    "participant_id": participant["id"],
                },
            ],
        },
    ]

    if invalid_case == "duplicate_item_participant":
        payload["items"][0]["participants"] = [
            {
                "participant_id": participant["id"],
            },
            {
                "participant_id": participant["id"],
            },
        ]

    elif invalid_case == "duplicate_receipt_participant":
        payload["participants"] = [
            {
                "participant_id": participant["id"],
            },
            {
                "participant_id": participant["id"],
            },
        ]

    elif invalid_case == "participant_from_another_meeting":
        payload["items"][0]["participants"] = [
            {
                "participant_id": foreign_participant["id"],
            },
        ]

    response = app_client.post(
        (
            f"/meetings/{meeting['uuid']}"
            f"/participant/{payer['id']}/receipts"
        ),
        json=payload,
    )

    assert response.status_code == 400