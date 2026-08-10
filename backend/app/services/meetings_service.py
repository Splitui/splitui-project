"""Модуль с бизнес-логикой для работы со встречами."""

from sqlalchemy.engine import Connection

from app.repositories import meetings_repository, participants_repository
from app.schemas.meetings import MeetingCreate
from app.db.dependencies import transaction


def get_meetings(connection: Connection, num_limit: int, num_offest: int):
    """Возвращает данные всех встреч.

    :param num_limit: максимальное количество встреч в ответе.
    :param num_offset: смещение относительно начала списка встреч.
    :param connection: соединение с базой данных.
    :return: список данных о встречах.
    """
    return meetings_repository.get_all(connection, num_limit, num_offest)


def get_meeting(connection: Connection, meeting_uuid):
    """Возвращает данные встречи по её UUID.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :return: данные встречи.
    """
    return meetings_repository.get_by_uuid(connection, meeting_uuid)


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
        data.meeting_date,
    )

    participants_repository.create(
        connection=connection,
        meeting_id=meeting["id"],
        nickname=data.creator_nickname,
        is_creator=True
    )

    return meeting
