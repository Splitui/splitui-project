"""Модуль с запросами к базе данных для работы с участниками встреч."""
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection


def create(
        connection: Connection,
        meeting_id: int,
        nickname: str,
        is_creator: bool
):
    """Создаёт нового участника встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param nickname: имя участника.
    :param is_creator: признак создателя встречи.
    :return: данные созданного участника.
    """
    result = connection.execute(
        text("""
             INSERT INTO participants (meeting_id, nickname, is_creator)
             VALUES (:meeting_id, :nickname, :is_creator) 
             RETURNING id, meeting_id, nickname, is_creator
             """),
        {
            "meeting_id": meeting_id,
            "nickname": nickname,
            "is_creator": is_creator,
        },
    )
    return result.mappings().one()


def get_all_by_meeting_uuid(
        connection: Connection,
        meeting_uuid: UUID,
        num_limit: int,
        num_offset: int
):
    """Возвращает данные участников указанной встречи.

    :param connection: соединение с базой данных.
    :param meeting_uuid: UUID встречи.
    :param num_limit: максимальное количество участников в ответе.
    :param num_offset: смещение относительно начала списка участников.
    :return: список данных участников.
    """
    result = connection.execute(
        text(
            """
            SELECT p.id,
                   p.nickname,
                   p.is_creator
            FROM participants p
                     JOIN meetings m
                          ON m.id = p.meeting_id
            WHERE m.uuid = :meeting_uuid
            ORDER BY p.id LIMIT :num_limit
            OFFSET :num_offset
            """
        ),
        {
            "meeting_uuid": str(meeting_uuid),
            "num_limit": num_limit,
            "num_offset": num_offset
        }
    )
    return result.mappings().all()

def get_all(
        connection: Connection,
        meeting_uuid: UUID,
):
    result = connection.execute(
        text(
            """
            SELECT p.id,p.nickname,p.is_creator
            FROM participants p
                        JOIN meetings m
                            ON m.id = p.meeting_id
            WHERE m.uuid = :meeting_uuid
            ORDER BY p.id
            """
        ),
        {
            "meeting_uuid": str(meeting_uuid),
    
        }
    )
    return result.mappings().all()
