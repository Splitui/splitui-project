"""Модуль с запросами к базе данных для работы с участниками встреч."""

import hashlib
import secrets

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
    session_id = secrets.token_urlsafe(32)
    session_id_hash = hash_token(session_id)
    result = connection.execute(
        text("""
             INSERT INTO participants (meeting_id, nickname, is_creator, session_id_hash)
             VALUES (:meeting_id, :nickname, :is_creator, :session_id_hash) 
             RETURNING id, meeting_id, nickname, is_creator
             """),
        {
            "meeting_id": meeting_id,
            "nickname": nickname,
            "is_creator": is_creator,
            "session_id_hash": session_id_hash
        },
    )
    participant = dict(result.mappings().one())
    participant["session_id"] = session_id
    return participant


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
             WHERE id = :participant_id RETURNING id, meeting_id, nickname, is_creator
             """),
        {
            "participant_id": participant_id,
            "nickname": nickname
        },
    )

    return dict(result.mappings().one())


def delete(connection: Connection, participant_id: int):
    """Удаляет участника встречи.

    :param connection: соединение с базой данных.
    :param participant_id: идентификатор участника.
    """
    connection.execute(
        text("""
            DELETE FROM participants WHERE id = :participant_id
        """),
        {"participant_id": participant_id}
    )


def get_all(
        connection: Connection,
        meeting_id: int,
        num_limit: int = -1,
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
                   meeting_id,
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
             SELECT id, meeting_id, nickname, is_creator
             FROM participants
             WHERE id = :participant_id
               and meeting_id = :meeting_id
             """),
        {
            "participant_id": participant_id,
            "meeting_id": meeting_id
        }
    )

    row = result.mappings().one_or_none()
    return dict(row) if row else None


def count_all(connection: Connection, meeting_id: int):
    """Возвращает количество участников встречи.

    :param connection: соединение с базой данных.
    :param meeting_id: идентификатор встречи.
    :return: количество участников.
    """
    result = connection.execute(
        text("SELECT COUNT(*) FROM participants WHERE meeting_id = :meeting_id"),
        {"meeting_id": meeting_id}
    )
    return result.scalar_one()


def get_by_session_id(connection: Connection, session_id: str):
    """Возвращает участника по его токену доступа.

    :param connection: соединение с базой данных.
    :param session_id: сырой токен участника (из заголовка запроса).
    :return: данные участника или None, если токен не найден.
    """
    session_id_hash = hash_token(session_id)
    result = connection.execute(
        text("""
            SELECT id, meeting_id, nickname, is_creator 
            FROM participants 
            WHERE session_id_hash = :session_id_hash
        """),
        {"session_id_hash": session_id_hash}
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None


def hash_token(token: str) -> str:
    """Возвращает SHA-256 хеш токена в hex-виде.

    :param token: исходный токен.
    :return: hex-представление хеша.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
