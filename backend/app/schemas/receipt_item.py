from decimal import Decimal

from pydantic import BaseModel, Field


class ReceiptItemsCreate(BaseModel):
    title: str = Field(min_length=0, max_length=100)
    quantity: int = Field(default=1, gt=0)
    unit_price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
