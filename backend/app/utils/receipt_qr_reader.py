from decimal import Decimal
from pathlib import Path

from app.config import settings
from app.schemas.parsed_receipts import ParsedReceipt, ParsedReceiptItem
import requests

def get_receipt(qr_raw: str):

    if qr_raw is None:
        return None
    
    response = requests.post(
        settings.check_api_url,
        data={
            "qrraw": qr_raw,
            "token": settings.check_api_token,
        },
        timeout=(20, 60),
    )
    response.raise_for_status()
    result = response.json()

    if result.get("code") != 1:
        return None

    return result["data"]["json"]


def kopecks_to_rubles(value: int | float) -> Decimal:
    return (
        round(float(value) / float("100"),2)
    )

def parse_receipt(receipt: dict):

    parsed_items = []

    for item in receipt.get("items", []):
        source_quantity = Decimal(str(item["quantity"]))

        if source_quantity == source_quantity.to_integral_value():
            quantity = int(source_quantity)
            unit_price = kopecks_to_rubles(item["price"])
        else:
            quantity = 1
            unit_price = kopecks_to_rubles(item["sum"])

        parsed_items.append(
            ParsedReceiptItem(
                title=item["name"].replace("\xa0", " ").strip(),
                unit_price=unit_price,
                quantity=quantity,
            )
        )

    return ParsedReceipt(
        title=(
            receipt.get("retailPlace")
            or receipt.get("user")
            or "Чек"
        ),
        purchase_date=receipt["dateTime"],
        items=parsed_items,
    )