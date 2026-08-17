"""Модуль для работы с бизнес-логикой участников встреч."""
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from app.db.dependencies import transaction
from app.db.tables.meetings import MeetingStatus
from app.repositories import participants_repository, bank_data_repository
from app.schemas.participants import ParticipantCreate, ParticipantUpdate
from app.services import meetings_service, bank_data_service


def get_participants_from_meeting(
        connection: Connection,
        meeting_id: int,
        num_limit: int,
        num_offset: int
):
    """Возвращает список участников встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param num_limit: максимальное количество участников в ответе.
    :param num_offset: смещение относительно начала списка участников.
    :return: список данных участников встречи.
    """
    return participants_repository.get_all(connection, meeting_id, num_limit, num_offset)


def get_participant_from_meeting(connection: Connection, meeting_id: int, participant_id: int):
    """Возвращает данные конкретного участника встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param participant_id: идентификатор участника.
    :return: данные участника.
    """
    participant = get_participant_or_error(connection, meeting_id, participant_id)
    participant["bank_data"] = bank_data_repository.get_bank_data_by_participant_id(connection, participant["id"])
    return participant


@transaction
def add_participant(connection: Connection, meeting_uuid: UUID, data: ParticipantCreate):
    """Добавляет нового участника к встрече.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи, к которой добавляется участник.
    :param data: данные для создания участника.
    :return: данные созданного участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    if meeting["status"] not in {MeetingStatus.ACTIVE, MeetingStatus.EDITING}:
        raise HTTPException(
            status_code=409,
            detail="Добавлять участника можно только в статусе встречи 'Активная' или 'Корректировка'",
        )

    try:
        return participants_repository.create(
            connection,
            meeting["id"],
            data.nickname,
            False
        )
    except IntegrityError as e:
        raise HTTPException(
            status_code=409,
            detail="Участник с таким никнеймом уже добавлен"
        )


@transaction
def update_participant(
        connection: Connection,
        meeting_uuid: UUID,
        session_id: str,
        data: ParticipantUpdate
):
    """Обновляет данные участника встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param data: данные для обновления участника.
    :return: обновлённые данные участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    participant = get_participant_by_session_id(connection, meeting["id"], session_id)

    if meeting["status"] not in {MeetingStatus.ACTIVE, MeetingStatus.EDITING}:
        raise HTTPException(
            status_code=409,
            detail="Редактировать участника можно только в статусе встречи 'Активная' или 'Корректировка'",
        )

    if data.nickname is not None:
        participant = participants_repository.update(connection, participant["id"], data.nickname)

    if data.card_number is not None or data.phone_number is not None:
        bank = bank_data_service.get_bank_or_error(connection, data.bank_id)
        bank_data = bank_data_repository.upsert(
            connection,
            participant["id"],
            bank["id"],
            data.card_number,
            data.phone_number
        )
        participant["bank_data"] = bank_data

    return participant


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


def get_participant_by_session_id(connection: Connection, meeting_id: int, session_id: str):
    """Возвращает текущего участника по session_id.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param session_id: идентификатор сессии участника.
    :return: данные текущего участника.
    """
    current_participant = participants_repository.get_by_session_id(connection, session_id)
    if current_participant is None:
        raise HTTPException(status_code=401, detail="Невалидный токен участника")

    if current_participant["meeting_id"] != meeting_id:
        raise HTTPException(status_code=403, detail="Участник не принадлежит данной встрече")

    return current_participant
