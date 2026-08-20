"""Модуль с эндпоинтами для работы с пользователями."""

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.api.dependencies import get_current_user
from app.db.dependencies import get_connection
from app.schemas.users import UserRegister, UserLogin
from app.services import users_service, meetings_service

router = APIRouter(
    prefix="",
    tags=["Авторизация"]
)


@router.post("/auth/register", status_code=201, summary="Зарегистрировать пользователя")
def register(
        data: UserRegister,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на регистрацию пользователя.

    :param data: логин и пароль.
    :param connection: соединение с базой данных.
    :return: данные пользователя и токен авторизации.
    """
    return users_service.register(connection, data.username, data.password)


@router.post("/auth/login", summary="Войти в аккаунт")
def login(
        data: UserLogin,
        connection: Connection = Depends(get_connection)
):
    """Обрабатывает запрос на вход в аккаунт.

    :param data: логин и пароль.
    :param connection: соединение с базой данных.
    :return: данные пользователя и токен авторизации.
    """
    return users_service.login(connection, data.username, data.password)


@router.get("/users/me/meetings", summary="Получить список встреч текущего пользователя")
def get_my_meetings(
        current_user: dict = Depends(get_current_user),
        connection: Connection = Depends(get_connection),
):
    """Обрабатывает запрос на получение списка встреч, в которых участвовал текущий пользователь.

    :param current_user: текущий авторизованный пользователь.
    :param connection: соединение с базой данных.
    :return: список встреч.
    """
    return meetings_service.get_meetings_for_user(connection, current_user["id"])
