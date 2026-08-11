"""Модуль с бизнес-логикой для работы с чеками."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import items_participants_repository, receipt_items_repository, receipts_repository, meetings_repository,participants_repository
from app.schemas.receipts import FullReceiptCreate


def get_receipts_from_meeting(connection: Connection, num_limit: int, num_offset: int, meeting_uuid: UUID):
    """Возвращает данные чеков указанной встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :return: список данных чеков.
    """
    return receipts_repository.get_all_by_meeting_uuid(connection,num_limit,num_offset,meeting_uuid)

def get_receipt_full(connection: Connection, receipt_id: int, num_limit: int, num_offset: int):
    receipt = receipts_repository.get_by_id(
        connection,
        receipt_id,
    )

    if receipt is None:
        raise HTTPException(
            status_code=404,
            detail="Чек не найден",
        )

    items = receipt_items_repository.get_all_by_receipt_id(
        connection,
        receipt_id,
        num_limit,
        num_offset,
    )

    result_items = []

    for item in items:
        participants = (
            items_participants_repository.get_all_by_item_id(
                connection,
                item["id"],
            )
        )

        result_items.append({
            **item,
            "participants": participants,
        })

    return {
        **receipt,
        "items": result_items,
    }


@transaction
def create_receipt_in_meeting(connection: Connection, meeting_uuid: UUID, data: FullReceiptCreate):
    """Создаёт чек.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param data: данные для создания чека.
    :return: данные созданного чека.
    """
    meeting = meetings_repository.get_by_uuid(
        connection,
        meeting_uuid,
    )

    participants = participants_repository.get_all(connection,meeting_uuid)

    meeting_participant = {
        participant["id"]
        for participant in participants
    }
    
    data_participant = {
        data.payer_id,
        *(
            participant.participant_id
            for item in data.items
            for participant in item.participants
        ),
    }

    missing_participant = (
        data_participant - meeting_participant
    )

    if missing_participant:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Некоторые участники не относятся к указанной встрече",
                "participant_ids": sorted(
                    missing_participant
                ),
            }
        )

    for item in data.items:

        participants = [
        participant.participant_id
        for participant in item.participants
        ]

        unique_participants = set(participants)

        if len(unique_participants) != len(participants):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": (
                        "Один участник не может быть указан "
                        "несколько раз в одной позиции"
                    ),
                    "item": item.title
                },
            )

        quantity = sum(
            participant.quantity
            for participant in item.participants
        )

        if quantity != item.quantity:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": (
                        "Распределённое количество не совпадает "
                        "с количеством позиции"
                    ),
                    "item": item.title,
                    "item_quantity": item.quantity,
                    "all_quantity": quantity,
                },
            )

    receipt = receipts_repository.create(
        connection,
        meeting["id"],
        data.payer_id,
        data.title,
        data.purchase_date,
        data.category,
        data.comment,
        data.image_url,
        data.is_confirmed,
    )

    created_items =  []
    total_amount = 0
    for item_data in data.items:
        receipt_item = receipt_items_repository.create(
            connection=connection,
            receipt_id=receipt["id"],
            title=item_data.title,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
        )

        item_participants = (
            items_participants_repository.create(
                connection=connection,
                receipt_item_id=receipt_item["id"],
                participants=item_data.participants,
                unit_price=item_data.unit_price,
            )
        )

        total_amount += item_data.unit_price * item_data.quantity

        created_items.append(
            {
                "item": receipt_item,
                "participants": item_participants,
            }
        )

    receipts_repository.update_total_amount(
        connection,
        receipt["id"],
        total_amount,
    )

    return {
        "receipt": {
            **receipt,
            "total_amount": total_amount,
        },
        "items": created_items,
    }


