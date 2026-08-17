"""Модуль структуры таблицы 'Категория кэшбэка'."""

from sqlalchemy import Column, String, Table, Text

from app.db.database import id_column, metadata

cashback_categories_table = Table(
    "cashback_categories",
    metadata,
    id_column(),
    Column("name", String(15), nullable=False)
)
