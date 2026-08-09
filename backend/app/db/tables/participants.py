"""
Модуль структуры таблицы 'Участник'.
"""

from sqlalchemy import ForeignKey, Boolean, String, func, DateTime, Table, Column, Integer

from app.db.database import metadata, id_column

participants_table = Table(
    "participants",
    metadata,
    id_column(),
    Column("meeting_id", Integer, ForeignKey("meetings.id"), nullable=False),
    Column("is_creator", Boolean, nullable=False, server_default="0"),
    Column("nickname", String(50), nullable=False),
    Column("bank_data_id", Integer, ForeignKey("bank_data.id"), nullable=True),
    Column("created_at", DateTime, nullable=False, server_default=func.now())
)
