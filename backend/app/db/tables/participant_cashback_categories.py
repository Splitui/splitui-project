"""
Модуль структуры таблицы 'Категория кэшбека участника'.
"""

from sqlalchemy import ForeignKey, Numeric, Table, Column, Integer

from app.db.database import metadata

participant_cashback_categories_table = Table(
    "participant_cashback_categories",
    metadata,
    Column("participant_id", Integer, ForeignKey("participants.id"), primary_key=True),
    Column("cashback_category_id", Integer, ForeignKey("cashback_categories.id"), primary_key=True),
    Column("cashback_percent", Numeric(5, 2), nullable=False)
)
