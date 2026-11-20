import re

from fastapi import APIRouter
from fastapi.responses import Response

from .docx_builder import build_quotation_docx
from .schemas import Quotation

router = APIRouter()
DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
DOCX_RESPONSE = {200: {"content": {DOCX_MIME: {}}, "description": "The quotation as a Word file"}}


def _docx_response(q: Quotation) -> Response:
    customer = re.sub(r"[^A-Za-z0-9]+", "_", q.to.name).strip("_") or "Customer"
    filename = f"Quotation_{customer}_{q.date:%d-%m-%Y}.docx"
    return Response(
        content=build_quotation_docx(q),
        media_type=DOCX_MIME,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            # Lets the React app (a different origin in production) read the filename.
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@router.post("/docx", response_class=Response, responses=DOCX_RESPONSE)
def download_quotation_docx(q: Quotation):
    """Generate the quotation on the company letterhead and download it as .docx."""
    return _docx_response(q)


@router.get("/docx/sample", response_class=Response, responses=DOCX_RESPONSE)
def download_sample_quotation_docx():
    """Open this URL in the browser to download a sample quotation (for checking the layout)."""
    return _docx_response(Quotation(**Quotation.model_config["json_schema_extra"]["example"]))
