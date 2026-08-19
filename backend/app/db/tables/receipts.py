"""Модуль структуры таблицы 'Чек'."""

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    Text,
    func,
    text,
)

from app.db.database import id_column, metadata

receipts_table = Table(
    "receipts",
    metadata,
    id_column(),
    Column("meeting_id", Integer, ForeignKey("meetings.id"), nullable=False),
    Column("payer_id", Integer, ForeignKey("participants.id"), nullable=False),
    Column("title", String(200), nullable=False),
    Column("total_amount", Numeric(10, 2), server_default=text("0.00")),
    Column("cashback_amount", Numeric(10, 2), server_default=text("0.00")),
    Column("purchase_date", DateTime(timezone=False), server_default=func.now()),
    Column("category", String(50), nullable=True),
    Column("comment", Text, nullable=True),
    Column("image_url", Text, nullable=True),
    Column("is_confirmed", Boolean, server_default=text("0")),
    Column("created_at", DateTime(timezone=False), nullable=False, server_default=func.now()),
    Column("updated_at", DateTime(timezone=False), nullable=True, onupdate=func.now())
)
