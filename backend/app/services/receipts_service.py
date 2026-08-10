"""Модуль с бизнес-логикой для работы с чеками."""

from uuid import UUID

from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import receipts_repository, meetings_repository
from app.schemas.receipts import ReceiptCreate


def get_receipts_from_meeting(connection: Connection, num_limit: int, num_offset: int, meeting_uuid: UUID):
    """Возвращает данные чеков указанной встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :return: список данных чеков.
    """
    return receipts_repository.get_all_by_meeting_uuid(connection,num_limit,num_offset,meeting_uuid)


@transaction
def create_receipt_in_meeting(connection: Connection, meeting_uuid: UUID, data: ReceiptCreate):
    """Создаёт чек.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param data: данные для создания чека.
    :return: данные созданного чека.
    """
    meeting = meetings_repository.get_by_uuid(
        connection,
        meeting_uuid,
    )

    receipt = receipts_repository.create(
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


@transaction
def update_total_amount(connection: Connection, receipt_id: int, item_amount: float):
    """Обновляет итоговую сумму чека на сумму позиции.

    :param connection: соединение с базой данных.
    :param receipt_id: идентификатор чека.
    :param item_amount: сумма позиции.
    :return: обновленная итоговая сумма.
    """
    total_amount = receipts_repository.update_total_amount(
        connection,
        receipt_id,
        item_amount,
    )
    return total_amount
