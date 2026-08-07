from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.participants import ParticipantCreate

from app.services import participant_service

router = APIRouter(
    prefix="/participants",
    tags=["Участники"],
)


@router.get("")
def get_participants(
        connection: Connection = Depends(get_connection),
):
    return participant_service.get_participants(connection)
