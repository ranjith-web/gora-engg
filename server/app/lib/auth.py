"""Admin authentication with Supabase.

The website signs in with Supabase and sends the access token as
`Authorization: Bearer <token>`. We ask Supabase who the token belongs to
(works for both legacy HS256 and new asymmetric signing keys, and respects
sign-outs), then optionally check the email against ADMIN_EMAILS.

Environment:
  SUPABASE_URL       https://<project>.supabase.co
  SUPABASE_ANON_KEY  the project's anon / publishable key (public, not secret)
  ADMIN_EMAILS       optional comma-separated allow-list, e.g. "a@x.com,b@y.com"
"""
import os
import time
from typing import Any, Dict, Optional, Tuple

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer = HTTPBearer(auto_error=False, description="Supabase access token of a signed-in admin")

# token -> (user, checked_at). Avoids a round-trip to Supabase on every request.
_cache: Dict[str, Tuple[Dict[str, Any], float]] = {}
_CACHE_SECONDS = 60


def _settings() -> Tuple[str, str, set]:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_ANON_KEY", "")
    admins = {e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()}
    return url, key, admins


def _deny(code: int, message: str) -> HTTPException:
    headers = {"WWW-Authenticate": "Bearer"} if code == status.HTTP_401_UNAUTHORIZED else None
    return HTTPException(status_code=code, detail=message, headers=headers)


async def _lookup_user(url: str, key: str, token: str) -> Optional[Dict[str, Any]]:
    hit = _cache.get(token)
    if hit and time.monotonic() - hit[1] < _CACHE_SECONDS:
        return hit[0]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{url}/auth/v1/user", headers={"apikey": key, "Authorization": f"Bearer {token}"})
    except httpx.HTTPError:
        raise _deny(status.HTTP_503_SERVICE_UNAVAILABLE, "Could not reach the login service. Please try again.")
    if r.status_code != 200:
        _cache.pop(token, None)
        return None
    user = r.json()
    if len(_cache) > 500:
        _cache.clear()
    _cache[token] = (user, time.monotonic())
    return user


async def require_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)) -> Dict[str, Any]:
    """FastAPI dependency: the signed-in admin's Supabase user, or 401/403."""
    url, key, admins = _settings()
    if not url or not key:
        raise _deny(status.HTTP_503_SERVICE_UNAVAILABLE,
                    "Login is not configured on the server (set SUPABASE_URL and SUPABASE_ANON_KEY).")
    if creds is None or creds.scheme.lower() != "bearer":
        raise _deny(status.HTTP_401_UNAUTHORIZED, "Please sign in.")
    user = await _lookup_user(url, key, creds.credentials)
    if user is None:
        raise _deny(status.HTTP_401_UNAUTHORIZED, "Your session has expired. Please sign in again.")
    email = (user.get("email") or "").lower()
    if admins and email not in admins:
        raise _deny(status.HTTP_403_FORBIDDEN, f"{email or 'This account'} is not allowed to use the admin tools.")
    return user
