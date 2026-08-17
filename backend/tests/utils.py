from datetime import datetime, timedelta, UTC


def future_date() -> datetime:
    return datetime.now(UTC) + timedelta(days=1)
