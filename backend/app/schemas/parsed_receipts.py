from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ParsedReceiptItem(BaseModel):
    title: str
    unit_price: Decimal
    quantity: int


class ParsedReceipt(BaseModel):
    title: str
    purchase_date: datetime
    items: list[ParsedReceiptItem]


class ReceiptQrRequest(BaseModel):
    qr_raw: str = Field(min_length=1)