"""Модуль структуры таблицы "Банк"."""

from sqlalchemy import Column, String, Table, Text

from app.db.database import id_column, metadata

banks_table = Table(
    "banks",
    metadata,
    id_column(),
    Column("name", String(100), nullable=False, unique=True),
    Column("deeplink", Text, nullable=True)
)
