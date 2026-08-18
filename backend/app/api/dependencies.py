from uuid import UUID
from fastapi import Header, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
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