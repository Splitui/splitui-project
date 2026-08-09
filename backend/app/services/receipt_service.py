""" Объявления функций для работы с чеками """

from uuid import UUID

from sqlalchemy.engine import Connection

from app.repositories import meeting_repository, receipt_repository
from app.schemas.receipt import ReceiptCreate

def get_receipts_from_meeting(connection: Connection,meeting_uuid: UUID):
    """
        Получения всех чеков встречи

        UUID: уникальный индификатор встречи

    """
    return receipt_repository.get_all_by_meeting_uuid(connection,meeting_uuid)

def create_receipt_in_meeting(connection: Connection,meeting_uuid:UUID, data: ReceiptCreate):
    """
        Создание чека в определенной встрече
    
        UUID: уникальный индификатор встречи
        Data: Информация о чеке (payer, title, category, comment, image_url, is_confirmed)
        
    """

    meeting = meeting_repository.get_by_uuid(
        connection,
        meeting_uuid,
    ) 

    receipt = receipt_repository.create(
            connection,
            meeting["id"],
            data.payer_id,
            data.title,
            data.category,
            data.comment,
            data.image_url,
            data.is_confirmed
        )
    return receipt

def update_total_amount(connection: Connection,reciept_id: int,item_amount: float):
    total_amount = receipt_repository.update_total_amount(
            connection,
            reciept_id,
            item_amount,
        )
    return total_amount