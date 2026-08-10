"""Модуль с бизнес-логикой для работы с позициями чека."""

from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import receipt_items_repository
from app.repositories.receipts_repository import update_total_amount
from app.schemas.receipt_items import ReceiptItemsCreate


<<<<<<< HEAD
def create_items_in_receipt(connection: Connection,receipt_id:int, data: ReceiptItemsCreate):
=======
def get_items_from_receipt(
        connection: Connection,
        receipt_id: int,
        num_limit: int,
        num_offset: int
):
    """Возвращает позиции указанного чека.
>>>>>>> 732bb3e2271698597a24900e1a7e1c16820bbddc

    :param connection: соединение с базой данных.
    :param receipt_id: идентификатор чека.
    :param num_limit: максимальное количество позиций в чеке.
    :param num_offset: смещение относительно начала списка позиций.
    :return: список данных о позициях чека.
    """
    return receipt_items_repository.get_all_by_receipt_id(
        connection,
        receipt_id,
        num_limit,
        num_offset
    )


@transaction
def create_items_in_receipt(
        connection: Connection,
        receipt_id: int,
        data: ReceiptItemsCreate
):
    """Создаёт позицию в чеке и обновляет итоговую сумму чека.

    :param connection: соединение с базой данных.
    :param receipt_id: идентификатор чека.
    :param data: данные для создания позиции чека.
    :return: данные созданной позиции и обновленную итоговую сумму чека.
    """
    receipt_item = receipt_items_repository.create(
        connection,
        receipt_id,
        data.title,
        data.quantity,
        data.unit_price,
    )

    total_amount = update_total_amount(connection, receipt_id, receipt_item["amount"])

    return receipt_item, total_amount
