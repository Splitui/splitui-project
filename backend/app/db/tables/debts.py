"""Модуль структуры таблицы 'Долг'."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, Table, func

from app.db.database import id_column, metadata

debts_table = Table(
    "debts",
    metadata,
    id_column(),
    Column("meeting_id", Integer, ForeignKey("meetings.id"), nullable=False),
    Column("debtor_id", Integer, ForeignKey("participants.id"), nullable=False),
    Column("creditor_id", Integer, ForeignKey("participants.id"), nullable=False),
    Column("amount", Numeric(5, 2), nullable=False),
    Column("created_at", DateTime(timezone=False), nullable=False, server_default=func.now())
)
