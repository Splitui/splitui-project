from uuid import UUID

from fastapi import APIRouter, Depends, Header
from sqlalchemy import Connection

from app.db.dependencies import get_connection
from app.services.amount_service import get_amount_info


router = APIRouter(
    prefix="",
    tags=["Денеги встречи"]
)

@router.get("/amount/{meeting_uuid}/{participant_id}", summary="Получить сумму потраченного")
def get_meeting_participant_amount_info(
        meeting_uuid: UUID,
        participant_id: int,
        session_id: str = Header(),
        connection: Connection = Depends(get_connection)
):
    """Получение сумму всех чеков встречи, сколько человек должен и сколько ему должны.

    :param meeting_uuid: UUID встречи.
    :param participant_id: id участника встречи.
    :param session_id идентификатор сессии участника.
    :param connection: соединение с базой данных.
    :return: список банков.
    """
    return get_amount_info(connection, meeting_uuid, session_id, participant_id)