from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.create_db import create_database
from app.seed_data import seed_reference_data

create_database()
seed_reference_data()

app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://v4.sabypractice.ru",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api")
