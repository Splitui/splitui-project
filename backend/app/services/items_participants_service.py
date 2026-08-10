"""Модуль с бизнес-логикой для работы со встречами."""

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.repositories import items_participants_repository as rip
from app.repositories import receipt_items_repository
from app.schemas.items_participants import ItemsParticipantsCreate
from app.db.dependencies import transaction


def get_debt_amount(connection: Connection,participants_id: int):
    return rip.get_all_amount(connection,participants_id)


@transaction
def create_item_participant(connection: Connection,receipt_item_id: int,data: ItemsParticipantsCreate):

    items = receipt_items_repository.get_items_info(connection,receipt_item_id)

    items_quantity =items["quantity"]
    items_unit_price =items["unit_price"]

    
    participants = data.participants

    data_quantity = sum(part.quantity for part in participants)

    if(data_quantity != items_quantity):
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Распределённое количество не совпадает с количеством позиции",
                "item_quantity": items_quantity,
                "distributed_quantity": data_quantity,
            },
        )

    items_part = []

    for part in participants:

        item_part = rip.create(
            connection,
            receipt_item_id,
            part.participant_id,
            part.quantity * items_unit_price,
        )
        items_part.append(item_part)

    return items_part
