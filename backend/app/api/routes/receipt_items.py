from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.receipt_item import ReceiptItemsCreate
from app.services import receipt_items_service

router = APIRouter(
    prefix="/receipts",
    tags=["Позиции чека"],
)


@router.get("/{receipt_id}/items", 
    summary="Получить позиции чека",
)
def get_meeting_receipts(
    receipt_id: int,
    limit: int,
    offset: int,
    connection: Connection = Depends(get_connection)
):
    return receipt_items_service.get_receipt_items_from_receipt(connection,
                                                                 limit,offset,receipt_id)

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
    return receipt_items_service.create_receipt_items_in_receipt(connection, receipt_id, data)
