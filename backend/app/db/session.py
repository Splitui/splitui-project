from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


DATABASE_URL = "sqlite:///./app.db"


engine = create_engine(
    DATABASE_URL,
    echo=True,
)


SessionFactory = sessionmaker(
    bind=engine,
    class_=Session,
    autoflush=False,
    expire_on_commit=False,
)