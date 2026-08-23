"""Модуль для работы с бизнес-логикой пользователей."""
import secrets

import bcrypt
from fastapi import HTTPException
from sqlalchemy.engine import Connection

from app.db.dependencies import transaction
from app.repositories import users_repository
from app.utils.security import hash_token, hash_password


@transaction
def register(connection: Connection, username: str, password: str):
    """Регистрирует нового пользователя.

    :param connection: соединение с базой данных.
    :param username: логин.
    :param password: пароль в открытом виде.
    :return: данные пользователя и токен сессии.
    """
    if users_repository.get_by_username(connection, username) is not None:
        raise HTTPException(
            status_code=409,
            detail=f"Логин '{username}' уже занят"
        )

    user = users_repository.create(connection, username, hash_password(password))
    token = secrets.token_urlsafe(32)
    users_repository.create_session(connection, user["id"], hash_token(token))
    user["auth_token"] = token
    return user


def login(connection: Connection, username: str, password: str):
    """Авторизует пользователя по логину и паролю.

    :param connection: соединение с базой данных.
    :param username: логин.
    :param password: пароль в открытом виде.
    :return: данные пользователя и токен сессии.
    """
    user = users_repository.get_by_username(connection, username)
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Введенный логин не найден"
        )

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Неверный логин или пароль"
        )

    token = secrets.token_urlsafe(32)
    users_repository.create_session(connection, user["id"], hash_token(token))

    return {"id": user["id"], "username": user["username"], "auth_token": token}


def get_user_id_by_token(connection: Connection, token: str | None):
    """Возвращает идентификатор зарегистрированного пользователя.

    :param connection: соединение с базой данных.
    :param token: токен пользователя.
    :return: идентификатор пользователя.
    """
    user_id = None
    if token is not None:
        user = users_repository.get_by_token(connection, token)
        user_id = user["id"] if user else None
    return user_id


def verify_password(password: str, password_hash: str):
    """Проверяет соответствие пароля его хешу.

    :param password: пароль в открытом виде.
    :param password_hash: сохранённый хеш пароля.
    :return: True, если пароль верный.
    """
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
