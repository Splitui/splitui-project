"""Модуль с запросами к базе данных для работы с категориями кешбека участника."""

from sqlalchemy import text
from sqlalchemy.engine import Connection


def get_all_categories(connection: Connection):
    """Возвращает список всех доступных категорий кешбэка.

    :param connection: соединение с базой данных.
    :return: список категорий кешбэка.
    """
    result = connection.execute(
        text("""
             SELECT *
             FROM cashback_categories
             ORDER BY id
             """)
    )

    return result.mappings().all()


def get_by_participant_id(connection: Connection, participant_id: int):
    """Возвращает список категорий кешбека участника с процентами.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :return: категорий кешбека участника.
    """
    result = connection.execute(
        text("""
             SELECT pcc.category_id, cc.name AS category_name, pcc.percent
             FROM participant_cashback_categories pcc
                      JOIN cashback_categories cc ON cc.id = pcc.category_id
             WHERE pcc.participant_id = :participant_id
             ORDER BY cc.id
             """),
        {"participant_id": participant_id}
    )
    return [dict(row) for row in result.mappings().all()]


def replace_all_for_participant(connection: Connection, participant_id: int, categories: list[dict]):
    """Заменяет выбранный набор категорий кешбэка участника.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :param categories: список выбранных категорий кешбэка.
    :return: актуальный список категорий кешбэка участника.
    """
    connection.execute(
        text("DELETE FROM participant_cashback_categories WHERE participant_id = :participant_id"),
        {"participant_id": participant_id}
    )

    if not categories:
        return []

    values = [
        {
            "participant_id": participant_id,
            "category_id": category["category_id"],
            "percent": category["percent"]
        }
        for category in categories
    ]

    connection.execute(
        text("""
             INSERT INTO participant_cashback_categories (participant_id, category_id, percent)
             VALUES (:participant_id, :category_id, :percent)
             """),
        values
    )

    return get_by_participant_id(connection, participant_id)


def get_best_cashback_by_category(connection: Connection, meeting_id: int, category_id: int):
    """Возвращает участников встречи с настроенным кешбеком по категории.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param category_id: идентификатор категории кешбека.
    :return: список кешбэков участников.
    """

    result = connection.execute(
        text("""
             SELECT p.id AS participant_id, p.nickname, pcc.percent
             FROM participant_cashback_categories pcc
                      JOIN participants p ON p.id = pcc.participant_id
             WHERE p.meeting_id = :meeting_id
               AND pcc.category_id = :category_id
             ORDER BY pcc.percent DESC
             """),
        {
            "meeting_id": meeting_id,
            "category_id": category_id
        }
    )
    return [dict(row) for row in result.mappings().all()]
