"""Модуль с бизнес-логикой для работы со встречами."""
from collections import defaultdict
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.repositories import meetings_repository, participants_repository
from app.schemas.meetings import MeetingCreate, MeetingUpdate
from app.db.dependencies import transaction


def get_meetings(connection: Connection, num_limit: int, num_offset: int):
    """Возвращает данные всех встреч.

    :param num_limit: максимальное количество встреч в ответе.
    :param num_offset: смещение относительно начала списка встреч.
    :param connection: соединение с базой данных.
    :return: список данных о встречах.
    """
    return meetings_repository.get_all(connection, num_limit, num_offset)


@transaction
def create_meeting(connection: Connection, data: MeetingCreate):
    """Создаёт встречу и добавляет её создателя в список участников.

    :param connection: соединение с базой данных.
    :param data: данные для создания встречи.
    :return: данные созданной встречи.
    """
    meeting = meetings_repository.create(
        connection,
        data.title,
        data.start_date,
    )

    meeting_creator = participants_repository.create(
        connection=connection,
        meeting_id=meeting["id"],
        nickname=data.creator_nickname,
        is_creator=True
    )
    meeting["meeting_creator"] = meeting_creator
    return meeting


@transaction
def update_meeting(connection, meeting_uuid, data: MeetingUpdate):
    """Обновляет данные встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param data: данные для обновления встречи.
    :return: обновлённые данные встречи.
    """
    meeting = get_meeting_or_error(connection, meeting_uuid)
    return meetings_repository.update(connection, meeting["id"], data)


def get_meeting_or_error(connection: Connection, meeting_uuid: UUID):
    """Возвращает данные встречи по UUID или бросает 404, если она не найдена.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :return: данные встречи.
    :raises HTTPException: 404, если встреча с указанным UUID не найдена.
    """
    meeting = meetings_repository.get_by_uuid(connection, meeting_uuid)
    if meeting is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"Не найдена встреча с uuid {meeting_uuid}"
            }
        )
    return meeting
