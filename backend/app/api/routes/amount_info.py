from uuid import UUID

from fastapi import APIRouter, Depends
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
        connection: Connection = Depends(get_connection)
):
    """Получение сумму всех чеков встречи, сколько человек должен и сколько ему должны.

    :param connection: соединение с базой данных.
    :meeting_uuid: UUID встречи.
    :participant_id: id участника встречи.
    :return: список банков.
    """
    return get_amount_info(connection,meeting_uuid,participant_id)