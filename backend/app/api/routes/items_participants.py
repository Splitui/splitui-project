"""Модуль с эндпоинтами для работы со встречами."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.items_participants import ItemsParticipantsCreate
from app.services import items_participants_service

router = APIRouter(
    prefix="",
    tags=["Связь Человек-Чек"],
)


@router.post("/receipt-items/{receipt_item_id}/participants", 
            status_code = 201,
            summary="Связать должников с позицией чека")
def create_item_participants(
    receipt_item_id: int,
    data: ItemsParticipantsCreate,
    connection: Connection = Depends(get_connection),
):
    return items_participants_service.create_item_participant(connection,receipt_item_id,data)


@router.get("/{participant_id}/debt", 
            summary="Связать должников с позицией чека")
def get_total_debt(
    participant_id: int,
    connection: Connection = Depends(get_connection),
):
    return items_participants_service.get_debt_amount(connection,participant_id)



