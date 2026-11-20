"""Minimal JSON-file collection store.

Swap this module for MongoDB / Postgres later without touching the route
modules (keep the same method names).
"""
import asyncio
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

DATA_DIR = Path(__file__).resolve().parents[2] / "data"


class Collection:
    def __init__(self, name: str):
        self.file = DATA_DIR / f"{name}.json"
        self._lock = asyncio.Lock()

    def _read(self) -> List[Dict[str, Any]]:
        try:
            return json.loads(self.file.read_text("utf-8"))
        except FileNotFoundError:
            return []

    def _write(self, rows: List[Dict[str, Any]]) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.file.write_text(json.dumps(rows, indent=2, ensure_ascii=False), "utf-8")

    async def list(self) -> List[Dict[str, Any]]:
        return sorted(self._read(), key=lambda r: r["createdAt"], reverse=True)

    async def get(self, id: str) -> Optional[Dict[str, Any]]:
        return next((r for r in self._read() if r["id"] == id), None)

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            rows = self._read()
            now = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
            row = {"id": str(uuid.uuid4()), "createdAt": now.replace("+00:00", "Z"), **data}
            rows.append(row)
            self._write(rows)
            return row


def collection(name: str) -> Collection:
    return Collection(name)
