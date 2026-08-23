from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class FullReceiptParticipantCreate(BaseModel):
    participant_id: int = Field(gt=0)


class FullReceiptItemCreate(BaseModel):
    id: int | None = Field(default=None, gt=0)
    title: str = Field(min_length=1, max_length=300)
    unit_price: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )
    quantity: int = Field(gt=0)
    participants: list[
        FullReceiptParticipantCreate
    ]


class FullReceiptCreate(BaseModel):
    id: int | None = Field(default=None, gt=0)
    payer_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=200)
    purchase_date: datetime
    category: str | None = Field(default=None, max_length=50)
    comment: str | None = None
    image_url: str | None = None
    is_confirmed: bool = False

    total_amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )
    participants: list[
        FullReceiptParticipantCreate
    ]

    items: list[FullReceiptItemCreate] | None = None