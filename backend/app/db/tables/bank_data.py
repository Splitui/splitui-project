"""Модуль структуры таблицы 'Банковские реквизиты'."""

from sqlalchemy import Column, ForeignKey, Integer, String, Table

from app.db.database import id_column, metadata

bank_data_table = Table(
    "bank_data",
    metadata,
    id_column(),
    Column("participant_id", Integer, ForeignKey("participants.id"), nullable=False, unique=True),
    Column("bank_id", Integer, ForeignKey("banks.id"), nullable=False),
    Column("card_number", String(25), nullable=True),
    Column("phone_number", String(15), nullable=True)
)
