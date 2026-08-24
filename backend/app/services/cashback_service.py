"""Модуль с бизнес-логикой для работы с кешбэками."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.db.tables.meetings import MeetingStatus
from app.repositories import cashback_repository
from app.schemas.cashbacks import ParticipantCashbackCategoriesUpdate
from app.services import meetings_service, participants_service


def get_all_categories(connection: Connection):
    """Возвращает список всех доступных категорий кешбэка.

    :param connection: соединение с базой данных.
    :return: список категорий кешбэка.
    """
    return cashback_repository.get_all_categories(connection)


def get_cashback_categories(connection: Connection, meeting_uuid: UUID, session_id: str):
    """Возвращает выбранные категории кешбека участника.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param participant_id: идентификатор участника.
    :return: список категорий кешбека участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    return cashback_repository.get_by_participant_id(connection, participant["id"])


@transaction
def update_cashback_categories(
        connection: Connection,
        meeting_uuid: UUID,
        session_id: str,
        data: ParticipantCashbackCategoriesUpdate,
):
    """Полностью заменяет набор категорий кешбека участника.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param data: новый список категорий кешбека с процентами.
    :return: актуальный список категорий кешбека участника.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    participant = participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)

    if meeting["status"] not in {MeetingStatus.ACTIVE, MeetingStatus.EDITING}:
        raise HTTPException(
            status_code=409,
            detail=f"Обновлять кешбэки участника можно только "
                   f"в статусе встречи '{MeetingStatus.ACTIVE}' или '{MeetingStatus.EDITING}'",
        )

    existing_category_ids = {c["id"] for c in cashback_repository.get_all_categories(connection)}
    for category in data.categories:
        if category.category_id not in existing_category_ids:
            raise HTTPException(
                status_code=422,
                detail=f"Не найдена категория кешбека с id {category.category_id}"
            )

    categories = [
        {"category_id": c.category_id, "percent": c.percent}
        for c in data.categories
        if c.percent > 0
    ]
    return cashback_repository.replace_all_for_participant(connection, participant["id"], categories)


def get_best_cashback(connection: Connection, meeting_id: int, category_id: int):
    """Возвращает список участников с лучшим кешбеком по указанной категории.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param category_id: идентификатор категории кешбека.
    :return: список участников, отсортированных по проценту кешбека по убыванию.
    """
    existing_category_ids = {c["id"] for c in cashback_repository.get_all_categories(connection)}
    if category_id not in existing_category_ids:
        raise HTTPException(
            status_code=422,
            detail=f"Не найдена категория кешбека с id {category_id}"
        )

    return cashback_repository.get_best_cashback_by_category(connection, meeting_id, category_id)
