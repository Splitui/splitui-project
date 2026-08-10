"""Модуль с запросами к базе данных для работы с встречами."""

import uuid
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.engine import Connection


def create(
        connection: Connection,
        title: str,
        meeting_date: datetime,
):
    """Создаёт новую встречу.

    :param connection: соединение с базой данных.
    :param title: название встречи.
    :param meeting_date: дата начала встречи.
    :return: данные созданной встречи.
    """
    result = connection.execute(
        text("""
             INSERT INTO meetings (uuid, title, start_date)
             VALUES (:meeting_uuid, :title, :meeting_date) RETURNING id, uuid, title, start_date
             """),
        {
            "meeting_uuid": str(uuid.uuid4()),
            "title": title,
            "meeting_date": meeting_date,
        },
    )

    return result.mappings().one()


def get_all(connection: Connection, num_limit: int, num_offset: int):
    """Возвращает данные всех встреч.

    :param num_limit: максимальное количество встреч в ответе.
    :param num_offset: смещение относительно начала списка встреч.
    :param connection: соединение с базой данных.
    :return: данные всех встреч.
    """
    result = connection.execute(
        text(
            """
            SELECT *
            FROM meetings
            ORDER BY id LIMIT :num_limit
            OFFSET :num_offset
            """
        ),
        {
            "num_limit": num_limit,
            "num_offset": num_offset
        }
    )

    return result.mappings().all()


def get_by_uuid(connection: Connection, meeting_uuid):
    """Возвращает данные встречи по UUID.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :return: данные встречи.
    """
    result = connection.execute(
        text(
            """
            SELECT *
            FROM meetings
            where uuid = :meeting_uuid
            """
        ),
        {
            "meeting_uuid": str(meeting_uuid)
        }
    )
    return result.mappings().one()
