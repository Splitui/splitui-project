"""Модуль структуры таблицы 'Позиция чека'."""

from sqlalchemy import (
    Column,
    Computed,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    func,
    text,
)

from app.db.database import id_column, metadata

receipt_items_table = Table(
    "receipt_items",
    metadata,
    id_column(),
    Column("receipt_id", Integer, ForeignKey("receipts.id"), nullable=False),
    Column("title", String(300), nullable=False),
    Column("quantity", Integer, server_default=text("1")),
    Column("unit_price", Numeric(10, 2), server_default=text("0.00")),
    Column("amount", Numeric(10, 2), Computed("unit_price * quantity")),
    Column("created_at", DateTime(timezone=False), nullable=False, server_default=func.now())
)
