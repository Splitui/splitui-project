from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.receipt import ReceiptCreate
from app.services import receipt_service

router = APIRouter(
    prefix="",
    tags=["Чеки"],
)


@router.get("/meetings/{meeting_uuid}/receipts", 
    summary="Получить чеки встречи",
)
def get_meeting_receipts(
    meeting_uuid: UUID,
    connection: Connection = Depends(get_connection)
):
    return receipt_service.get_receipts_from_meeting(connection, meeting_uuid)

@router.post(
    "/meetings/{meeting_uuid}/receipts",
    summary="Создать чек во встрече",
)
def add_receipt_in_meetings(
    meeting_uuid: UUID,
    data: ReceiptCreate,
    connection: Connection = Depends(get_connection),
):
    return receipt_service.create_receipt_in_meeting(connection,meeting_uuid, data)
