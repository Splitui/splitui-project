from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.meeting import MeetingCreate
from app.services import meeting_service

router = APIRouter(
    prefix="/meetings",
)


@router.get("")
def get_meetings(
        connection: Connection = Depends(get_connection),
):
    return meeting_service.get_meetings(connection)


@router.post("", status_code=201)
def create_meeting(
        data: MeetingCreate,
        connection: Connection = Depends(get_connection),
):
    return meeting_service.create_meeting(connection, data)
