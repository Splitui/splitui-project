"""
Модуль структуры таблицы "Банк".
"""

from sqlalchemy import Table, Column, Integer, String, Text

from app.db.database import metadata, id_column

banks_table = Table(
    "banks",
    metadata,
    id_column(),
    Column("name", String(100), nullable=False),
    Column("icon_url", Text, nullable=True)
)
