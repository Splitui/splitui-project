from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.db.dependencies import get_connection
from app.schemas.meeting import MeetingCreate
from app.schemas.participants import ParticipantCreate
from app.services import meeting_service

router = APIRouter(
    prefix="/meetings",
    tags=["Встречи"],
)


@router.get("", summary="Получить список всех встреч")
def get_meetings(
    limit: int,
    offset: int,
    connection: Connection = Depends(get_connection),
):
    return meeting_service.get_meetings(connection,limit,offset)


@router.get("/{meeting_uuid}", summary="Получить информацию по встрече")
def get_meeting(
        meeting_uuid: UUID,
        connection: Connection = Depends(get_connection)
):
    return meeting_service.get_meeting(connection, meeting_uuid)


@router.get("/{meeting_uuid}/participants", summary="Получить участников встречи")
def get_participants(
        meeting_uuid: UUID,
        limit: int,
        offset: int,
        connection: Connection = Depends(get_connection)
):
    return meeting_service.get_participants(connection,limit,offset,meeting_uuid)


@router.post("", status_code=201, summary="Создать встречу")
def create_meeting(
        data: MeetingCreate,
        connection: Connection = Depends(get_connection),
):
    return meeting_service.create_meeting(connection, data)


@router.post("/{meeting_uuid}/participants", summary="Добавить участника к встрече")
def add_participant(
        meeting_uuid: UUID,
        data: ParticipantCreate,
        connection: Connection = Depends(get_connection)
):
    return meeting_service.add_participant(connection, meeting_uuid, data)
