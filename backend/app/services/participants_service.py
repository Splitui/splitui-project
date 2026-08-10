"""Модуль для работы с бизнес-логикой участников встреч."""
from uuid import UUID

from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import meetings_repository, participants_repository
from app.schemas.participants import ParticipantCreate


def get_participants_from_meeting(
        connection: Connection,
        meeting_uuid: UUID,
        num_limit: int,
        num_offset: int
):
    """Возвращает список участников встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param num_limit: максимальное количество участников в ответе.
    :param num_offset: смещение относительно начала списка участников.
    :return: список данных участников встречи.
    """
    return participant_repository.get_all_by_meeting_uuid(
        connection,
        meeting_uuid,
        num_limit,
        num_offset
    )


@transaction
def add_participant(connection, meeting_uuid, data: ParticipantCreate):
    """Добавляет нового участника к встрече.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи, к которой добавляется участник.
    :param data: данные для создания участника.
    :return: данные созданного участника.
    """
    meeting = meeting_repository.get_by_uuid(connection, meeting_uuid)

    return participant_repository.create(
        connection,
        meeting["id"],
        data.nickname,
        False
    )
