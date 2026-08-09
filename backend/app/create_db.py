from app.db.engine import engine
from app.db.database import metadata
from app.db import tables


def create_database() -> None:
    metadata.create_all(bind=engine)
    print("Таблицы успешно созданы")
