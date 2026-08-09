"""Модуль с зависимостями для получения соединения с базой данных."""

from sqlalchemy.engine import Connection

from app.db.engine import engine


def get_connection():
    """Возвращает соединение с базой данных."""

    with engine.connect() as connection:
        yield connection
