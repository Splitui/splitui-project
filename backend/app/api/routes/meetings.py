
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.api.dependencies import get_connection
from app.schemas.meeting import MeetingCreate

router = APIRouter(
    prefix="/meetings",
)


@router.get("")
def get_meetings(
    connection: Connection = Depends(get_connection),
):
    result = connection.execute(
        text("SELECT * FROM meetings ORDER BY id")
    )
    return result.mappings().all()


@router.post("", status_code=201)
def create_meeting(
    data: MeetingCreate,
    connection: Connection = Depends(get_connection),
):
    result = connection.execute(
        text("""
            INSERT INTO meetings (
                uuid,
                title,
                is_public,
                status
            )
            VALUES (
                lower(hex(randomblob(16))),
                :title,
                :is_public,
                'ACTIVE'
            )
            RETURNING *
        """),
        {
            "title": data.title,
            "is_public": data.is_public,
        },
    )

    meeting = result.mappings().one()
    connection.commit()

    return dict(meeting)
