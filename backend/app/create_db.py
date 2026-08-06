from app.db.base import Base
from app.db.session import engine

import app.models


def create_database() -> None:
    Base.metadata.create_all(bind=engine)
    print("Таблицы успешно созданы")


if __name__ == "__main__":
    create_database()
