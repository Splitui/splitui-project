from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.participants import ParticipantCreate

from app.services import participant_service

router = APIRouter(
    prefix="/participants",
)


@router.get("")
def get_participants(
        connection: Connection = Depends(get_connection),
):
    return participant_service.get_participants(connection)


@router.post("", status_code=201)
def create_participant(
        data: ParticipantCreate,
        connection: Connection = Depends(get_connection)
):
    return participant_service.create_participant(connection, data)
