"""Модуль с запросами к базе данных для работы с встречами."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.db.tables.meetings import MeetingStatus
from app.schemas.meetings import MeetingUpdate


def create(
        connection: Connection,
        title: str,
        start_date: datetime,
):
    """Создаёт новую встречу.

    :param connection: соединение с базой данных.
    :param title: название встречи.
    :param start_date: дата начала встречи.
    :return: данные созданной встречи.
    """
    result = connection.execute(
        text("""
             INSERT INTO meetings (uuid, title, start_date)
             VALUES (:meeting_uuid, :title, :start_date) RETURNING id, uuid, title, start_date
             """),
        {
            "meeting_uuid": str(uuid4()),
            "title": title,
            "start_date": start_date.isoformat(),
        },
    )

    return dict(result.mappings().one())


def update(connection: Connection, meeting_id: int, data: MeetingUpdate):
    """Обновляет данные встречи.

    Если данные для обновления не переданы, возвращает текущие данные встречи без изменений.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param data: данные для обновления встречи.
    :return: обновлённые данные встречи.
    """
    fields = data.model_dump(exclude_unset=True)
    if not fields:
        return get_by_id(connection, meeting_id)

    set_updating = ", ".join(f"{key} = :{key}" for key in fields)
    fields["meeting_id"] = meeting_id

    result = connection.execute(
        text(f"UPDATE meetings SET {set_updating} WHERE id = :meeting_id RETURNING *"),
        fields
    )
    return dict(result.mappings().one())


def update_status(connection: Connection, meeting_id: int, status: MeetingStatus):
    """Обновляет статус встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param status: новый статус встречи.
    :return: обновлённые данные встречи.
    """
    result = connection.execute(
        text("""
             UPDATE meetings
             SET status =:status
             WHERE id = :meeting_id RETURNING *
             """),
        {
            "meeting_id": meeting_id,
            "status": status
        }
    )

    return result.mappings().one()


def finish(connection: Connection, meeting_id: int):
    """Устанавливает статус 'Завершена' и текущую дату время завершения.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :return: обновлённые данные встречи.
    """
    result = connection.execute(
        text("""
             UPDATE meetings
             SET status   = :status,
                 end_date = :end_date
             WHERE id = :meeting_id RETURNING *
             """),
        {
            "meeting_id": meeting_id,
            "status": MeetingStatus.FINISHED,
            "end_date": datetime.now().isoformat()
        }
    )

    return dict(result.mappings().one())


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


def get_by_uuid(connection: Connection, meeting_uuid: UUID):
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
            WHERE uuid = :meeting_uuid
            """
        ),
        {
            "meeting_uuid": str(meeting_uuid)
        }
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None


def get_by_id(connection: Connection, meeting_id: int):
    """Возвращает данные встречи по ID.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :return: данные встречи.
    """
    result = connection.execute(
        text(
            """
            SELECT *
            FROM meetings
            WHERE id = :meeting_id
            """
        ),
        {
            "meeting_id": meeting_id
        }
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None
