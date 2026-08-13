"""Модуль для работы с бизнес-логикой участников встреч."""
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import meetings_repository, participants_repository, bank_data_repository
from app.schemas.participants import ParticipantCreate, ParticipantUpdate
from app.services import meetings_service


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
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    return participants_repository.get_all(
        connection,
        meeting["id"],
        num_limit,
        num_offset
    )


def get_participant_from_meeting(connection: Connection, meeting_uuid: UUID, participant_id: int):
    """Возвращает данные конкретного участника встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор участника.
    :return: данные участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    return get_participant_or_error(connection, meeting["id"], participant_id)


@transaction
def add_participant(connection, meeting_uuid, data: ParticipantCreate):
    """Добавляет нового участника к встрече.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи, к которой добавляется участник.
    :param data: данные для создания участника.
    :return: данные созданного участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    return participants_repository.create(
        connection,
        meeting["id"],
        data.nickname,
        False
    )


@transaction
def update_participant(connection, meeting_uuid, participant_id: int, data: ParticipantUpdate):
    """Обновляет данные участника встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор участника.
    :param data: данные для обновления участника.
    :return: обновлённые данные участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    participant = get_participant_or_error(connection, meeting["id"], participant_id)

    if data.nickname is not None:
        participants_repository.update(connection, participant["id"], data.nickname)

    if data.card_number is not None or data.phone_number is not None:
        bank_data_repository.update(connection, participant["id"], data.bank_id, data.card_number, data.phone_number)

    return participants_repository.get_by_id(connection, meeting["id"], participant["id"])


def get_participant_or_error(connection: Connection, meeting_id, participant_id):
    """Возвращает данные участника по id или бросает 404, если он не найден.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param participant_id: идентификатор участника.
    :return: данные участника.
    :raises HTTPException: 404, если участник не найден.
    """
    participant = participants_repository.get_by_id(connection, meeting_id, participant_id)
    if participant is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"Не найден участник с id {participant_id}"
            }
        )
    return participant


def get_creator(connection: Connection, meeting_uuid: UUID):
    return participants_repository.get_meeting_creator(connection,meeting_uuid)