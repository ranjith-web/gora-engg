import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import api

app = FastAPI(title="Gora Engineering API")

origins = os.environ.get("CORS_ORIGIN")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins.split(",") if origins else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api, prefix="/api")
