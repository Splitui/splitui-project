from sqlalchemy.engine import Connection

from app.repositories import participant_repository
from app.schemas.participants import ParticipantCreate


def get_participants(connection: Connection):
    return participant_repository.get_participants(connection)


def create_participant(connection: Connection, data: ParticipantCreate):
    return participant_repository.create_participant(
        connection,
        data.meeting_id,
        data.nickname,
        data.is_creator
    )