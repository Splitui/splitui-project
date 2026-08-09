"""
Модуль структуры таблицы 'Участники позиции чека'.
"""

from sqlalchemy import ForeignKey, Numeric, Table, Column, Integer

from app.db.database import metadata

receipt_item_participants_table = Table(
    "receipt_item_participants",
    metadata,
    Column("receipt_item_id", Integer, ForeignKey("receipt_items.id"), primary_key=True),
    Column("participant_id", Integer, ForeignKey("participants.id"), primary_key=True),
    Column("share_amount", Numeric(10, 2), nullable=False)
)
