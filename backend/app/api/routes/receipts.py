"""Модуль с эндпоинтами для работы с чеками встречи."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.receipts import FullReceiptCreate
from app.services import receipts_service

router = APIRouter(
    prefix="",
    tags=["Чеки"],
)


@router.get("/meetings/{meeting_uuid}/receipts",
    summary="Получить чеки встречи",
)
def get_meeting_receipts(
    meeting_uuid: UUID,
    limit: int,
    offset: int,
    connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение чеков встречи.

    :param meeting_uuid: UUID встречи.
    :param connection: соединение с базой данных.
    :return: список чеков встречи.
    """
    return receipts_service.get_receipts_from_meeting(connection,limit,offset,meeting_uuid)


@router.get(
    "/receipts/{receipt_id}",
    summary="Получить чек с позициями и участниками",
)
def get_full_receipt(
    receipt_id: int,
    limit: int ,
    offset: int,
    connection: Connection = Depends(get_connection),
):
    return receipts_service.get_receipt_full(
        connection,
        receipt_id,
        limit,
        offset,
    )


@router.post(
    "/meetings/{meeting_uuid}/receipts",
    status_code=201,
    summary="Создать чек во встрече",
)
def add_receipt_in_meetings(
    meeting_uuid: UUID,
    data: FullReceiptCreate,
    connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на создание чека во встрече.

    :param meeting_uuid: UUID встречи.
    :param data: данные для создания чека.
    :param connection: соединение с базой данных.
    :return: данные созданного чека.
    """
    return receipts_service.create_receipt_in_meeting(connection,meeting_uuid, data)
