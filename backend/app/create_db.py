"""Модуль для создания таблиц базы данных."""

from app.db import tables
from app.db.database import metadata
from app.db.engine import engine


def create_database():
    """Создаёт таблицы базы данных."""
    metadata.create_all(bind=engine)
    print("Таблицы успешно созданы")
