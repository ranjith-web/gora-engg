import os

from dotenv import load_dotenv

load_dotenv()  # local dev: read server/.env (on Render, set variables in the dashboard)

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware

from app.routes import api  # noqa: E402

app = FastAPI(title="Gora Engineering API")

origins = os.environ.get("CORS_ORIGIN")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins.split(",") if origins else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api, prefix="/api")
