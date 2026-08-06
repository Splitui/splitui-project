from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CashbackCategory(Base):
    __tablename__ = "cashback_categories"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    icon_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
