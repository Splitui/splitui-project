"""Модуль с бизнес-логикой для работы со встречами."""
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.db.tables.meetings import MeetingStatus
from app.repositories import meetings_repository, participants_repository, receipts_repository, debts_repository
from app.schemas.meetings import MeetingCreate, MeetingUpdate
from app.services import participants_service, users_service
from app.services.change_log_service import (
    change_log,
    parse_created_meeting_context,
    parse_meeting_status_context,
    parse_updated_meeting_context
)


def get_meetings(connection: Connection, num_limit: int, num_offset: int):
    """Возвращает данные всех встреч.

    :param num_limit: максимальное количество встреч в ответе.
    :param num_offset: смещение относительно начала списка встреч.
    :param connection: соединение с базой данных.
    :return: список данных о встречах.
    """
    return meetings_repository.get_all(connection, num_limit, num_offset)


@transaction
@change_log(
    action="meeting.created",
    context_parser=parse_created_meeting_context,
)
def create_meeting(connection: Connection, data: MeetingCreate, token: str | None):
    """Создаёт встречу и добавляет её создателя в список участников.

    :param connection: соединение с базой данных.
    :param data: данные для создания встречи.
    :param token: токен авторизованного пользователя.
    :return: данные созданной встречи.
    """
    user_id = users_service.get_user_id_by_token(connection, token)
    meeting = meetings_repository.create(
        connection,
        data.title,
        data.start_date,
    )

    meeting_creator = participants_repository.create(
        connection=connection,
        meeting_id=meeting["id"],
        nickname=data.creator_nickname,
        is_creator=True,
        user_id=user_id
    )
    meeting["meeting_creator"] = meeting_creator
    return meeting


@transaction
@change_log(
    action="meeting.updated",
    context_parser=parse_updated_meeting_context,
)
def update_meeting(connection, meeting_uuid, session_id, data: MeetingUpdate):
    """Обновляет данные встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param data: данные для обновления встречи.
    :return: обновлённые данные встречи.
    """
    meeting = get_meeting_or_error(connection, meeting_uuid)
    current_participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    if not current_participant["is_creator"]:
        raise HTTPException(
            status_code=403,
            detail="Редактировать встречу может только создатель встречи"
        )

    if meeting["status"] not in {MeetingStatus.ACTIVE, MeetingStatus.EDITING}:
        raise HTTPException(
            status_code=409,
            detail="Редактировать встречу можно только в статусе 'Активная' или 'Корректировка'",
        )

    return meetings_repository.update(connection, meeting["id"], data)


@transaction
@change_log(
    action="meeting.calculating",
    context_parser=parse_meeting_status_context,
)
def calculate_meeting(connection, meeting_uuid, session_id):
    """Переводит встречу в статус 'В расчёте'.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :return: обновлённые данные встречи.
    """
    meeting = get_meeting_or_error(connection, meeting_uuid)
    current_participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    if not current_participant["is_creator"]:
        raise HTTPException(
            status_code=403,
            detail="Перевести встречу в статус 'В расчёте' может только создатель встречи"
        )

    if meeting["status"] not in {MeetingStatus.ACTIVE, MeetingStatus.EDITING}:
        raise HTTPException(
            status_code=409,
            detail="Перейти к расчётам можно только из статусов 'Активная' или 'Корректировка'"
        )

    missing_payers = receipts_repository.get_payers_without_bank_data(connection, meeting["id"])
    if missing_payers:
        nicknames = ", ".join(p["nickname"] for p in missing_payers)
        raise HTTPException(
            status_code=409,
            detail="Нельзя перейти к расчётам, "
                   f"у следующих участников не указаны банковские реквизиты: {nicknames}"
        )

    return meetings_repository.update_status(
        connection=connection,
        meeting_id=meeting["id"],
        status=MeetingStatus.CALCULATING,
    )


@transaction
@change_log(
    action="meeting.finished",
    context_parser=parse_meeting_status_context,
)
def finish_meeting(connection: Connection, meeting_uuid: UUID, session_id):
    """Завершает встречу.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :return: обновлённые данные завершённой встречи.
    """
    meeting = get_meeting_or_error(connection, meeting_uuid)
    current_participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    if not current_participant["is_creator"]:
        raise HTTPException(
            status_code=403,
            detail="Перевести встречу в статус 'Завершена' может только создатель встречи"
        )

    if meeting["status"] != MeetingStatus.CALCULATING:
        raise HTTPException(
            status_code=409,
            detail=(
                "Завершить встречу можно только в статусе 'В расчёте'"
            )
        )

    unpaid_count = debts_repository.count_unpaid_for_meeting(connection, meeting["id"])
    if unpaid_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Нельзя завершить встречу, так как есть непогашенные долги: {unpaid_count}"
        )

    return meetings_repository.finish(connection, meeting["id"])


@transaction
@change_log(
    action="meeting.editing",
    context_parser=parse_meeting_status_context,
)
def edit_meeting(connection, meeting_uuid, session_id):
    """Переводит встречу в статус «Корректировка».

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :return: обновлённые данные встречи.
    """
    meeting = get_meeting_or_error(connection, meeting_uuid)
    current_participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    if not current_participant["is_creator"]:
        raise HTTPException(
            status_code=403,
            detail="Перевести встречу в статус 'Корректировка' может только создатель встречи"
        )

    if meeting["status"] != MeetingStatus.CALCULATING:
        raise HTTPException(
            status_code=409,
            detail=(
                "Вернуть к корректировкам можно только в статусе 'В расчёте'"
            )
        )
    return meetings_repository.update_status(
        connection=connection,
        meeting_id=meeting["id"],
        status=MeetingStatus.EDITING,
    )


def get_meetings_for_user(connection: Connection, user_id: int):
    """Возвращает список встреч, в которых пользователь был участником.

    :param connection: соединение с базой данных.
    :param user_id: идентификатор зарегистрированного пользователя.
    :return: список встреч.
    """
    return meetings_repository.get_meetings_for_user(connection, user_id)


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
