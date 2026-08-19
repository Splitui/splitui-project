"""Модуль для работы с бизнес-логикой участников встреч."""
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from app.db.dependencies import transaction
from app.db.tables.meetings import MeetingStatus
from app.repositories import participants_repository, bank_data_repository, receipts_repository, debts_repository, \
    cashback_repository
from app.schemas.participants import ParticipantCreate, ParticipantUpdate
from app.services import meetings_service, bank_data_service, receipt_items_service
from app.services.change_log_service import change_log, parse_created_participant_context, \
    parse_updated_participant_context


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
@change_log(
    action="participant.created",
    context_parser=parse_created_participant_context,
)
def add_participant(connection, meeting_uuid, data: ParticipantCreate):
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
@change_log(
    action="participant.updated",
    context_parser=parse_updated_participant_context,
)
def update_participant(connection, meeting_uuid, session_id, data: ParticipantUpdate):
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


@transaction
def delete_participant(connection: Connection, meeting_uuid: UUID, session_id: str, participant_id: int):
    """Удаляет участника встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param participant_id: идентификатор удаляемого участника.
    :param session_id: идентификатор сессии участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    current_participant = get_participant_by_session_id(connection, meeting["id"], session_id)

    participant = get_participant_or_error(connection, meeting["id"], participant_id)

    if not (current_participant["is_creator"] or current_participant["id"] == participant["id"]):
        raise HTTPException(
            status_code=403,
            detail="Удалить участника может только создатель встречи или сам участник"
        )

    if participant["is_creator"]:
        is_only_participant = participants_repository.count_all(connection, meeting["id"]) == 1
        if meeting["status"] != MeetingStatus.FINISHED and not is_only_participant:
            raise HTTPException(
                status_code=409,
                detail="Создатель может выйти из встречи только если она завершена "
                       "или он единственный участник встречи"
            )
    elif meeting["status"] == MeetingStatus.ACTIVE or meeting["status"] == MeetingStatus.EDITING:
        if receipts_repository.count_receipts_as_payer(connection, participant["id"]) > 0:
            raise HTTPException(
                status_code=409,
                detail="Нельзя удалить участника, так как он связан с чеком"
            )
    elif meeting["status"] == MeetingStatus.CALCULATING:
        unpaid_count = debts_repository.count_unpaid_for_participant(
            connection,
            meeting["id"],
            participant["id"]
        )
        if unpaid_count > 0:
            raise HTTPException(
                status_code=409,
                detail="Нельзя удалить участника, так как с ним связаны непогашенные долги"
            )

    receipt_items_service.update_after_delete_participant(connection, meeting["id"], participant["id"])
    bank_data_repository.delete_by_participant_id(connection, participant_id)
    cashback_repository.delete_by_participant_id(connection, participant_id)
    participants_repository.delete(connection, participant["id"])


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
