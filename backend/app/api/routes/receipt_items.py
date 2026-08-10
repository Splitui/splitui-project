"""Модуль с эндпоинтами для работы с позициями чека."""


from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.receipt_items import ReceiptItemsCreate
from app.services import receipt_items_service

router = APIRouter(
    prefix="/receipts",
    tags=["Позиции чека"],
)


@router.get(
    "/{receipt_id}/items",
    summary="Получить позиции чека"
)
def get_meeting_receipts(
        receipt_id: int,
        limit: int,
        offset: int,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение позиций чека.

    :param receipt_id: идентификатор чека.
    :param limit: максимальное количество позиций в ответе.
    :param offset: смещение относительно начала списка позиций.
    :param connection: соединение с базой данных.
    :return: список позиций чека.
    """
    return receipt_items_service.get_items_from_receipt(
        connection,
        receipt_id,
        limit,
        offset,
    )

@router.get(
    "/{receipt_id}/{items_id}",
    summary="Получить одну позицию чека"
)
def get_receipt_item(
        receipt_id: int,
        items_id: int,
        connection: Connection = Depends(get_connection)
):
    return receipt_items_service.get_items_info_by_receipt(
        connection,
        receipt_id,
        items_id,
    )

@router.post(
    "/{receipt_id}/items",
    status_code=201,
    summary="Создать позицию в чеке",
)
def add_receipt_in_meetings(
        receipt_id: int,
        data: ReceiptItemsCreate,
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на создание позиции в чеке.

    :param receipt_id: идентификатор чека.
    :param data: данные для создания позиции чека.
    :param connection: соединение с базой данных.
    :return: данные созданной позиции чека.
    """
    return receipt_items_service.create_items_in_receipt(connection, receipt_id, data)
