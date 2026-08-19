"""Модуль с зависимостями для получения соединения с базой данных."""

from functools import wraps

from app.db.engine import engine


def get_connection():
    """Возвращает соединение с базой данных."""
    with engine.connect() as connection:
        yield connection


def transaction(func):
    """Декоратор для функций, выполняющих запись в базу данных.

    Декорируемая функция должна принимать 'connection' первым
    позиционным аргументом.
    """

    @wraps(func)
    def wrapper(connection, *args, **kwargs):
        with connection.begin():
            return func(connection, *args, **kwargs)

    return wrapper
