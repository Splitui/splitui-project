from datetime import datetime
import uuid
from sqlalchemy import text
from sqlalchemy.engine import Connection


def create(
        connection: Connection,
        title: str,
        meeting_date: datetime,
):
    result = connection.execute(
        text("""
             INSERT INTO meetings (uuid, title, start_date)
             VALUES (:meeting_uuid, :title, :meeting_date) RETURNING id, uuid, title, start_date
             """),
        {
            "meeting_uuid": str(uuid.uuid4()),
            "title": title,
            "meeting_date": meeting_date,
        },
    )

    return result.mappings().one()


def get_all(connection: Connection):
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


def get_by_uuid(connection: Connection, meeting_uuid):
    result = connection.execute(
        text(
            """
            SELECT *
            FROM meetings
            where uuid = :meeting_uuid
            """
        ),
        {
            "meeting_uuid": str(meeting_uuid)
        }
    )
    return result.mappings().one()
