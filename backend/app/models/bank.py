from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Bank(Base):
    __tablename__ = "banks"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    icon_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
