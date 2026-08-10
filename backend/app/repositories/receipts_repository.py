"""Модуль с запросами к базе данных для работы с чеками."""

from sqlalchemy import text
from sqlalchemy.engine import Connection


def create(
        connection: Connection,
        meeting_id: int,
        payer_id: int,
        title: str,
        category: str,
        comment: str,
        image_url: str,
        is_confirmed: bool,
):
    """Создаёт новый чек.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param payer_id: идентификатор плательщика.
    :param title: наименование чека.
    :param category: категория чека.
    :param comment: комментарий к чеку.
    :param image_url: ссылка на изображение чека.
    :param is_confirmed: признак подтверждения чека.
    :return: данные созданного чека.
    """
    result = connection.execute(
        text("""
             INSERT INTO receipts (meeting_id, payer_id, title,
             category, comment, image_url, is_confirmed)
             VALUES (:meeting_id, :payer_id, :title,
             :category, :comment, :image_url, :is_confirmed) RETURNING *
             """),
        {
            "meeting_id": meeting_id,
            "payer_id": payer_id,
            "title": title,
            "category": category,
            "comment": comment,
            "image_url": image_url,
            "is_confirmed": is_confirmed,
        },
    )
    return result.mappings().one()

def get_all(connection: Connection):
    result = connection.execute(
        text(
            """
            SELECT *
            FROM receipts
            ORDER BY id
            """
        )
    )

    return result.mappings().all()


def get_all_by_meeting_uuid(connection: Connection, num_limit: int, num_offset: int , meeting_uuid):
    """Возвращает данные чеков указанной встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :return: список данных о чеках.
    """

    result = connection.execute(
        text(
            """
            SELECT r.*
            FROM receipts r
                     JOIN meetings m
                          ON m.id = r.meeting_id
            WHERE m.uuid = :meeting_uuid
            ORDER BY r.id
            LIMIT :num_limit OFFSET :num_offset
            """
        ),
        {
            "meeting_uuid": str(meeting_uuid),
            "num_limit": str(num_limit),
            "num_offset": str(num_offset)
        }
    )

    return result.mappings().all()

def update_total_amount(connection: Connection, receipt_id: int, item_amount: float):
    """Обновляет итоговую сумму чека.

    :param connection: соединение с базой данных.
    :param receipt_id: идентификатор чека.
    :param item_amount: сумма позиции.
    :return: обновленная итоговая сумма чека.
    """
    result = connection.execute(
        text(
            """
            UPDATE receipts
            SET total_amount = total_amount + :item_amount
            WHERE id = :receipt_id
            RETURNING total_amount
            """
        ),
        {
            "receipt_id": receipt_id,
            "item_amount": float(item_amount)
        }
    )

    return result.scalar_one()

