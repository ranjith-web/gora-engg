from fastapi import APIRouter

from app.modules.quotations.routes import router as quotations

# Register each new module here, e.g. quotations, invoices, ai:
#   from app.modules.quotations.routes import router as quotations
#   api.include_router(quotations, prefix="/quotations")
api = APIRouter()


@api.get("/health")
def health():
    return {"ok": True}


api.include_router(quotations, prefix="/quotations", tags=["quotations"])
