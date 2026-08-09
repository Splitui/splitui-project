"""
Модуль структуры таблицы 'Банковские реквизиты'.
"""

from sqlalchemy import ForeignKey, String, Table, Integer, Column

from app.db.database import metadata, id_column

bank_data_table = Table(
    "bank_data",
    metadata,
    id_column(),
    Column("bank_id", Integer, ForeignKey("banks.id"), nullable=False),
    Column("card_number", String(25), nullable=True),
    Column("phone_number", String(15), nullable=True)
)
