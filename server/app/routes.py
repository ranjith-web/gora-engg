from fastapi import APIRouter, Depends

from app.lib.auth import require_admin

from app.modules.quotations.routes import router as quotations

# Register each new module here, e.g. quotations, invoices, ai:
#   from app.modules.quotations.routes import router as quotations
#   api.include_router(quotations, prefix="/quotations")
api = APIRouter()


@api.get("/health")
def health():
    return {"ok": True}


@api.get("/me", tags=["auth"])
def me(user=Depends(require_admin)):
    """Who is signed in (also confirms the account is an allowed admin)."""
    return {"email": user.get("email"), "id": user.get("id")}


# Everything below requires a signed-in admin (Supabase login).
api.include_router(quotations, prefix="/quotations", tags=["quotations"], dependencies=[Depends(require_admin)])
