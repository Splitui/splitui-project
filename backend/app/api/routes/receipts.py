"""Модуль с эндпоинтами для работы с чеками встречи."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.parsed_receipts import ParsedReceipt, ReceiptQrRequest
from app.schemas.receipts import FullReceiptCreate
from app.services import receipts_service
from app.utils.receipt_qr_reader import get_receipt, parse_receipt

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
    session_id: str = Header(),
    connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение чеков встречи.

    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: список чеков встречи.
    """
    return receipts_service.get_receipts_from_meeting(connection, meeting_uuid, session_id, limit, offset)


@router.get(
    "/meetings/{meeting_uuid}/receipts/{receipt_id}",
    summary="Получить чек с позициями и участниками",
)
def get_full_receipt(
    meeting_uuid: UUID,
    receipt_id: int,
    limit: int,
    offset: int,
    session_id: str = Header(),
    connection: Connection = Depends(get_connection),
):
    return receipts_service.get_receipt_full(
        connection,
        meeting_uuid,
        session_id,
        receipt_id,
        limit,
        offset,
    )


@router.post(
    "/meetings/{meeting_uuid}/receipts",
    status_code=200,
    summary="Создать чек во встрече",
)
def add_receipt_in_meetings(
    meeting_uuid: UUID,
    data: FullReceiptCreate,
    session_id: str = Header(),
    connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на создание чека во встрече.

    :param meeting_uuid: UUID встречи.
    :param data: данные для создания чека.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: данные созданного чека.
    """
    return receipts_service.create_or_update_receipt_in_meeting(connection, meeting_uuid, session_id, data)


@router.post("/qr",
            response_model=ParsedReceipt,
            summary="Создать чек во встрече",)
def read_qr_and_parse(data: ReceiptQrRequest):
    receipt_info = get_receipt(data.qr_raw)

    if receipt_info is None:
        raise HTTPException(
            status_code=422,
            detail="Не удалось получить данные чека",
        )

    return parse_receipt(receipt_info)


@router.delete(
    "/meetings/{meeting_uuid}/receipts/{receipt_id}",
    status_code=200,
    summary="Удалить чек",
)
def delete_receipt(
    meeting_uuid: UUID,
    receipt_id: int,
    session_id: str = Header(),
    connection: Connection = Depends(get_connection),
):
    return receipts_service.delete_receipt(connection, meeting_uuid, session_id, receipt_id)