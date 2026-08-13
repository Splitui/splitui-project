"""Модуль с запросами к базе данных для работы с участниками встреч."""

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
             VALUES (:meeting_id, :nickname, :is_creator) RETURNING id, meeting_id, nickname, is_creator
             """),
        {
            "meeting_id": meeting_id,
            "nickname": nickname,
            "is_creator": is_creator,
        },
    )
    return result.mappings().one()


def update(
        connection: Connection,
        participant_id: int,
        nickname: str
):
    """Обновляет данные участника.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :param nickname: новый никнейм участника.
    :return: обновлённые данные участника.
    """
    result = connection.execute(
        text("""
             UPDATE participants
             SET nickname = :nickname
             WHERE id = :participant_id RETURNING *
             """),
        {
            "participant_id": participant_id,
            "nickname": nickname
        },
    )

    return result.mappings().one()


def get_all(
        connection: Connection,
        meeting_id: int,
        num_limit: int | None = None,
        num_offset: int = 0
):
    """Возвращает данные участников указанной встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :param num_limit: максимальное количество участников в ответе.
    :param num_offset: смещение относительно начала списка участников.
    :return: список данных участников.
    """
    result = connection.execute(
        text(
            """
            SELECT id,
                   nickname,
                   is_creator
            FROM participants
            WHERE meeting_id = :meeting_id
            ORDER BY id LIMIT :num_limit
            OFFSET :num_offset
            """
        ),
        {
            "meeting_id": meeting_id,
            "num_limit": num_limit,
            "num_offset": num_offset
        }
    )
    return result.mappings().all()


def get_by_id(connection: Connection, meeting_id: int, participant_id: int):
    """Возвращает данные участника по его идентификатору.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    :param meeting_id: идентификатор встречи.
    :return: данные участника.
    """
    result = connection.execute(
        text("""
             SELECT *
             FROM participants
             WHERE id = :participant_id
               and meeting_id = :meeting_id
             """),
        {
            "participant_id": participant_id,
            "meeting_id": meeting_id
        }
    )
    return result.mappings().one_or_none()
