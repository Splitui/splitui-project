from uuid import UUID

from fastapi import Header, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.engine import Connection

from app.api.security import security
from app.db.dependencies import get_connection
from app.repositories import users_repository
from app.services import meetings_service, participants_service


def get_meeting_for_participant(
        meeting_uuid: UUID,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection),
):
    """Возвращает встречу, если текущий участник имеет к ней доступ.

    :param meeting_uuid: UUID встречи из пути запроса.
    :param session_id: токен участника, передаваемый в заголовке.
    :param connection: соединение с базой данных.
    :return: данные встречи.
    """
    meeting = meetings_service.get_meeting_or_error(connection, meeting_uuid)
    participants_service.get_participant_by_session_id(connection, meeting["id"], session_id)
    return meeting


def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        connection: Connection = Depends(get_connection),
):
    """Определяет текущего авторизованного пользователя по токену.

    :param credentials: реквизиты пользователя.
    :param connection: соединение с базой данных.
    :return: данные пользователя.
    """
    user = users_repository.get_by_token(connection, credentials.credentials)
    if user is None:
        raise HTTPException(status_code=401, detail="Невалидный токен")
    return user
