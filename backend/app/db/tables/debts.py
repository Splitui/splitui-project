"""
Модуль структуры таблицы 'Долг'.
"""

from sqlalchemy import ForeignKey, Numeric, DateTime, func, Column, Integer, Table

from app.db.database import metadata, id_column

debts_table = Table(
    "debts",
    metadata,
    id_column(),
    Column("debtor_id", Integer, ForeignKey("participants.id"), nullable=False),
    Column("creditor_id", Integer, ForeignKey("participants.id"), nullable=False),
    Column("amount", Numeric(5, 2), nullable=False),
    Column("created_at", DateTime(timezone=False), nullable=False, server_default=func.now())
)
