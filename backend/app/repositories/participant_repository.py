from sqlalchemy.engine import Connection
from sqlalchemy import text


def create_participant(
        connection: Connection,
        meeting_id: int,
        nickname: str,
        is_creator: bool
):
    result = connection.execute(
        text("""
             INSERT INTO participants (meeting_id, nickname, is_creator)
             VALUES (:meeting_id, :nickname, :is_creator)
             """),
        {
            "meeting_id": meeting_id,
            "nickname": nickname,
            "is_creator": is_creator,
        },
    )
    return {"id": result.lastrowid, "nickname": nickname}


def get_participants(connection: Connection):
    result = connection.execute(
        text(
            """
            SELECT *
            FROM participants
            ORDER BY id
            """
        )
    )

    return result.mappings().all()
