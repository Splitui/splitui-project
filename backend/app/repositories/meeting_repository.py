from datetime import datetime
from uuid import uuid4
from sqlalchemy import text
from sqlalchemy.engine import Connection


def create_meeting(
        connection: Connection,
        title: str,
        meeting_date: datetime,
) -> tuple[int, str]:
    meeting_uuid = str(uuid4())

    result = connection.execute(
        text("""
             INSERT INTO meetings (uuid, title, start_date)
             VALUES (:meeting_uuid, :title, :meeting_date)
             """),
        {
            "meeting_uuid": meeting_uuid,
            "title": title,
            "meeting_date": meeting_date,
        },
    )

    meeting_id = result.lastrowid

    return meeting_id, meeting_uuid


def get_meetings(connection: Connection):
    result = connection.execute(
        text(
            """
            SELECT *
            FROM meetings
            ORDER BY id
            """
        )
    )

    return result.mappings().all()
