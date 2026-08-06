from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class BankData(Base):
    __tablename__ = "bank_data"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    bank_id: Mapped[int] = mapped_column(
        ForeignKey("banks.id"),
        nullable=False,
    )

    card_number: Mapped[str | None] = mapped_column(
        String(25),
        nullable=True,
    )

    phone_number: Mapped[str | None] = mapped_column(
        String(15),
        nullable=True,
    )
