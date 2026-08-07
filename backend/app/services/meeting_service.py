from sqlalchemy.engine import Connection

from app.repositories import meeting_repository, participant_repository
from app.schemas.meeting import MeetingCreate


def get_meetings(connection: Connection):
    return meeting_repository.get_meetings(connection)


def create_meeting(connection: Connection, data: MeetingCreate):
    meeting_id, meeting_uuid = meeting_repository.create_meeting(
        connection,
        data.title,
        data.meeting_date,
    )

    participant_repository.create_participant(
        connection=connection,
        meeting_id=meeting_id,
        nickname=data.creator_name,
        is_creator=True
    )

    return {"uuid": meeting_uuid}
