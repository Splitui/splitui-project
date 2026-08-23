"""Модуль с запросами к базе данных для работы с пользователями."""

from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.utils.security import hash_token


def create(connection: Connection, username: str, password_hash: str):
    """Создаёт нового пользователя.

    :param connection: соединение с базой данных.
    :param username: логин пользователя.
    :param password_hash: хеш пароля.
    :return: данные созданного пользователя.
    """
    result = connection.execute(
        text("""
             INSERT INTO users (username, password_hash)
             VALUES (:username, :password_hash)
             RETURNING id, username, created_at
             """),
        {
            "username": username,
            "password_hash": password_hash
        }
    )
    return dict(result.mappings().one())


def create_session(connection: Connection, user_id: int, token_hash: str):
    """Создаёт сессию пользователя.

    :param connection: соединение с базой данных.
    :param user_id: идентификатор зарегистрированного пользователя.
    :param token_hash: хеш токена сессии.
    """
    connection.execute(
        text("INSERT INTO user_sessions (user_id, token_hash) VALUES (:user_id, :token_hash)"),
        {
            "user_id": user_id,
            "token_hash": token_hash
        }
    )


def get_by_username(connection: Connection, username: str):
    """Возвращает данные пользователя по логину.

    :param connection: соединение с базой данных.
    :param username: логин пользователя.
    :return: данные пользователя.
    """
    result = connection.execute(
        text("SELECT * FROM users WHERE username = :username"),
        {"username": username}
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None


def get_by_token(connection: Connection, token: str):
    """Возвращает пользователя по токену сессии.

    :param connection: соединение с базой данных.
    :param token: сырой токен из заголовка.
    :return: данные пользователя.
    """
    result = connection.execute(
        text("""
             SELECT u.id, u.username
             FROM user_sessions s
                      JOIN users u ON u.id = s.user_id
             WHERE s.token_hash = :token_hash
             """),
        {"token_hash": hash_token(token)}
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None
