"""Модуль со схемами для работы с позициями чека."""

from decimal import Decimal

from pydantic import BaseModel, Field


class ReceiptItemsCreate(BaseModel):
    """Схема для создания позиции чека.

    :ivar title: наименование позиции.
    :ivar quantity: количество единиц позиции.
    :ivar unit_price: цена за единицу.
    """

    title: str = Field(min_length=0, max_length=100)
    quantity: int = Field(default=1, gt=0)
    unit_price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
