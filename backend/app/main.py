from fastapi import FastAPI

from app.api.router import api_router
from app.create_db import create_database

create_database()

app = FastAPI()
app.include_router(api_router)
