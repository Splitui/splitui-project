"""
Модуль структуры таблицы 'Категория кэшбэка'.
"""

from sqlalchemy import String, Text, Column, Integer, Table

from app.db.database import metadata, id_column

cashback_categories_table = Table(
    "cashback_categories",
    metadata,
    id_column(),
    Column("name", String(50), nullable=False),
    Column("icon_url", Text, nullable=True)
)
