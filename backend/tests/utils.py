from datetime import datetime, timedelta


def future_date() -> datetime:
    return datetime.now() + timedelta(days=1)
