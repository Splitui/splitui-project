from decimal import Decimal
from pathlib import Path

from app.config import settings
from app.schemas.parsed_receipts import ParsedReceipt, ParsedReceiptItem
import requests

def get_receipt(qr_raw: str):

    if qr_raw is None:
        return None


    for token in settings.check_api_token:
        response = requests.post(
            settings.check_api_url,
            data={
                "qrraw": qr_raw,
                "token": token,
            },
            timeout=(20, 60),
        )

        if response.status_code in {401, 403, 429}:
            continue

        response.raise_for_status()
        result = response.json()

        if result.get("code") != 1:
            return None

        return result["data"]["json"]

    return None


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

        title = item.get("name") or "Товар"

        parsed_items.append(
            ParsedReceiptItem(
                title=title.replace("\xa0", " ").strip()[:300],
                unit_price=unit_price,
                quantity=quantity,
            )
        )

    return ParsedReceipt(
        title=(
            receipt.get("user")
            or receipt.get("retailPlace")
            or "Чек"
        ),
        purchase_date=receipt["dateTime"],
        items=parsed_items,
    )
