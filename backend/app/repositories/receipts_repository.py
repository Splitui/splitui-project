"""Модуль с запросами к базе данных для работы с чеками."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection


def create(
        connection: Connection,
        meeting_id: int,
        payer_id: int,
        title: str,
        purchase_date: datetime,
        category: str,
        comment: str,
        image_url: str,
        is_confirmed: bool,
        total_amount: float | None
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

    if total_amount is None:
        total_amount = 0

    result = connection.execute(
        text("""
             INSERT INTO receipts (meeting_id, payer_id, title, purchase_date,
             category, comment, image_url, is_confirmed,total_amount)
             VALUES (:meeting_id, :payer_id, :title, :purchase_date,
             :category, :comment, :image_url, :is_confirmed,:total_amount) RETURNING *
             """),
        {
            "meeting_id": meeting_id,
            "payer_id": payer_id,
            "title": title,
            "purchase_date": purchase_date,
            "category": category,
            "comment": comment,
            "image_url": image_url,
            "is_confirmed": is_confirmed,
            "total_amount": float(total_amount),
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


def get_by_id(
        connection: Connection,
        receipt_id: int,
):
    result = connection.execute(
        text(
            """
            SELECT *
            FROM receipts
            WHERE id = :receipt_id
            """
        ),
        {
            "receipt_id": receipt_id,
        },
    )

    return result.mappings().one_or_none()


def get_all_by_meeting_uuid(connection: Connection, meeting_id, num_limit: int, num_offset: int):
    """Возвращает данные чеков указанной встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param num_limit: максимальное количество чеков в ответе.
    :param num_offset: смещение относительно начала списка чеков.
    :return: список данных о чеках.
    """
    result = connection.execute(
        text(
            """
            SELECT *
            FROM receipts
            WHERE meeting_id = :meeting_id
            ORDER BY id
            LIMIT :num_limit OFFSET :num_offset
            """
        ),
        {
            "meeting_id": meeting_id,
            "num_limit": num_limit,
            "num_offset": num_offset,
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
            SET total_amount = :item_amount
            WHERE id = :receipt_id
            RETURNING total_amount
            """
        ),
        {
            "receipt_id": receipt_id,
            "item_amount": float(item_amount),
        }
    )

    return result.scalar_one()


def update(
        connection: Connection,
        receipt_id: int,
        payer_id: int,
        title: str,
        purchase_date: datetime,
        category: str | None,
        comment: str | None,
        image_url: str | None,
        is_confirmed: bool,
        total_amount: float | None
):
    if total_amount is None:
        total_amount = 0

    result = connection.execute(
        text("""
            UPDATE receipts
            SET payer_id = :payer_id,
                title = :title,
                purchase_date = :purchase_date,
                category = :category,
                comment = :comment,
                image_url = :image_url,
                is_confirmed = :is_confirmed,
                total_amount = :total_amount
            WHERE id = :receipt_id
            RETURNING *
        """),
        {
            "receipt_id": receipt_id,
            "payer_id": payer_id,
            "title": title,
            "purchase_date": purchase_date,
            "category": category,
            "comment": comment,
            "image_url": image_url,
            "is_confirmed": is_confirmed,
            "total_amount": float(total_amount),
        },
    )

    return result.mappings().one()


def delete(
        connection: Connection,
        receipt_id: int,
):
    connection.execute(
        text("""
            DELETE FROM receipt_item_participants
            WHERE receipt_item_id IN (
                SELECT id
                FROM receipt_items
                WHERE receipt_id = :receipt_id
            )
        """),
        {
            "receipt_id": receipt_id,
        },
    )

    connection.execute(
        text("""
            DELETE FROM receipt_items
            WHERE receipt_id = :receipt_id
        """),
        {
            "receipt_id": receipt_id,
        },
    )

    result = connection.execute(
        text("""
            DELETE FROM receipts
            WHERE id = :receipt_id
            RETURNING id
        """),
        {
            "receipt_id": receipt_id,
        },
    )

    return result.scalar_one_or_none()


def get_meeting_total_amount(
        connection: Connection,
        meeting_uuid: UUID,
):
    result = connection.execute(
        text("""
            SELECT SUM(r.total_amount) 
            FROM receipts r JOIN meetings m on m.id == r.meeting_id
            WHERE m.uuid = :meeting_uuid
        """),
        {
            "meeting_uuid": str(meeting_uuid),
        },
    )

    return result.scalar_one_or_none()


def get_participant_spend(
        connection: Connection,
        participant_id: int,
        meeting_id,
):
    result = connection.execute(
        text("""
            SELECT SUM(total_amount)
            FROM receipts
            WHERE payer_id = :participant_id
            AND meeting_id = :meeting_id
        """),
        {
            "participant_id": participant_id,
            "meeting_id": meeting_id,
        },
    )

    return result.scalar_one_or_none()


def get_payers_without_bank_data(connection: Connection, meeting_id: int) -> list[dict]:
    """Возвращает данные плательщиков, которые не указали банковские реквизиты.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :return: данные плательщиков без банковских реквизитов.
    """
    result = connection.execute(
        text("""
             SELECT DISTINCT p.id, p.nickname
             FROM receipts r
                      JOIN participants p ON p.id = r.payer_id
                      LEFT JOIN bank_data bd ON bd.participant_id = p.id
             WHERE r.meeting_id = :meeting_id
               AND bd.id IS NULL
             """),
        {"meeting_id": meeting_id}
    )
    return [dict(row) for row in result.mappings().all()]


def count_receipts_as_payer(connection: Connection, participant_id: int):
    result = connection.execute(
        text("SELECT COUNT(*) FROM receipts WHERE payer_id = :participant_id"),
        {"participant_id": participant_id}
    )
    return result.scalar_one()
