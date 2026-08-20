"""Модуль с эндпоинтами для работы с участниками встречи."""
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.engine import Connection

from app.api.dependencies import get_meeting_for_participant
from app.api.security import security
from app.db.dependencies import get_connection
from app.schemas.participants import ParticipantCreate, ParticipantUpdate
from app.services import participants_service

router = APIRouter(
    prefix="",
    tags=["Участники"],
)


@router.get("/meetings/meetings/{meeting_uuid}/participants", summary="Получить участников встречи")
def get_participants(
        limit: int,
        offset: int,
        meeting: dict = Depends(get_meeting_for_participant),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение списка участников встречи.

    :param limit: максимальное количество участников в ответе.
    :param offset: смещение относительно начала списка участников.
    :param meeting: данные встречи.
    :param connection: соединение с базой данных.
    :return: список данных участников встречи.
    """
    return participants_service.get_participants_from_meeting(
        connection,
        meeting["id"],
        limit,
        offset
    )


@router.get("/meetings/meetings/{meeting_uuid}/participants/{participant_id}", summary="Получить участника встречи")
def get_participant(
        participant_id: int,
        meeting: dict = Depends(get_meeting_for_participant),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на получение данных конкретного участника встречи.

    :param participant_id: идентификатор участника.
    :param meeting: данные встречи.
    :param connection: соединение с базой данных.
    :return: данные участника.
    """
    return participants_service.get_participant_from_meeting(connection, meeting["id"], participant_id)


@router.post("/meetings/meetings/{meeting_uuid}/participants", status_code=201, summary="Добавить участника к встрече")
def add_participant(
        meeting_uuid: UUID,
        data: ParticipantCreate,
        credentials: HTTPAuthorizationCredentials | None = Depends(security),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на добавление участника к встрече.

    :param meeting_uuid: UUID встречи.
    :param data: данные для создания участника.
    :param credentials: реквизиты пользователя.
    :param connection: соединение с базой данных.
    :return: данные созданного участника.
    """
    token = credentials.credentials if credentials else None
    return participants_service.add_participant(connection, meeting_uuid, data, token)


@router.patch("/meetings/meetings/{meeting_uuid}/participants/me", summary="Обновить участника встречи")
def update_participant(
        meeting_uuid: UUID,
        data: ParticipantUpdate,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на частичное обновление данных участника встречи.

    :param meeting_uuid: UUID встречи.
    :param data: данные для обновления участника.
    :param session_id: идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: обновлённые данные участника.
    """
    return participants_service.update_participant(connection, meeting_uuid, session_id, data)


@router.delete(
    "/meetings/{meeting_uuid}/participants/{participant_id}",
    status_code=204,
    summary="Удалить участника встречи",
)
def delete_participant(
        meeting_uuid: UUID,
        participant_id: int,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на удаление участника встречи.

    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param participant_id: идентификатор участника.
    :param connection: соединение с базой данных.
    """
    participants_service.delete_participant(connection, meeting_uuid, session_id, participant_id)


@router.post("/meetings/{meeting_uuid}/participants/restore-session", summary="Восстановить сессию участника")
def restore_session(
        meeting_uuid: UUID,
        credentials: HTTPAuthorizationCredentials = Depends(security),
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на восстановление сессии участника по токену пользователя.

    :param meeting_uuid: UUID встречи.
    :param credentials: реквизиты пользователя.
    :param connection: соединение с базой данных.
    :return: данные участника.
    """
    return participants_service.restore_session(connection, meeting_uuid, credentials.credentials)


@router.post(
    "/meetings/{meeting_uuid}/participants/link-account",
    summary="Привязать участника к аккаунту"
)
def link_participant_to_user(
        meeting_uuid: UUID,
        session_id: str = Header(),
        credentials: HTTPAuthorizationCredentials = Depends(security),
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на привязку текущего участника встречи к аккаунту пользователя.

    :param meeting_uuid: UUID встречи.
    :param session_id: идентификатор сессии участника.
    :param credentials: реквизиты пользователя.
    :param connection: соединение с базой данных.
    :return: обновлённые данные участника.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Невалидный токен")
    return participants_service.link_participant_to_user(
        connection,
        meeting_uuid,
        session_id,
        credentials.credentials
    )
