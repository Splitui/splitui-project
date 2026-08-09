from uuid import UUID

from sqlalchemy.engine import Connection

from app.repositories import receipt_items_repository
from app.repositories.receipt_repository import update_total_amount
from app.schemas.receipt_item import ReceiptItemsCreate

def get_receipt_items_from_receipt(connection: Connection,num_limit: int ,num_offset: int ,receipt_id: int):
    return receipt_items_repository.get_all_by_receipt_id(connection,num_limit,
                                                          num_offset,receipt_id)

def create_receipt_items_in_receipt(connection: Connection,receipt_id:int, data: ReceiptItemsCreate):

    receipt_item = receipt_items_repository.create(
            connection,
            receipt_id,
            data.title,
            data.quantity,
            data.unit_price,
        )

    total_amount = update_total_amount(connection,receipt_id,receipt_item["amount"])
    
    return receipt_item, total_amount
