"""IGDB fetcher — games.

IGDB requires a Twitch OAuth access token. Register a Twitch app at
    https://dev.twitch.tv/console/apps
and put TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET in .env.

IGDB uses an Apicalypse-style POST body, not query params.
Output matches the canonical Media shape.
"""
from __future__ import annotations
import os
import time
import requests

OAUTH_URL = "https://id.twitch.tv/oauth2/token"
BASE = "https://api.igdb.com/v4"
IMG_BASE = "https://images.igdb.com/igdb/image/upload/t_cover_big"

_token_cache: dict | None = None


def _token() -> str:
    global _token_cache
    if _token_cache and _token_cache["expires_at"] > time.time() + 60:
        return _token_cache["access_token"]

    r = requests.post(
        OAUTH_URL,
        params={
            "client_id": os.environ["TWITCH_CLIENT_ID"],
            "client_secret": os.environ["TWITCH_CLIENT_SECRET"],
            "grant_type": "client_credentials",
        },
        timeout=30,
    )
    r.raise_for_status()
    body = r.json()
    _token_cache = {
        "access_token": body["access_token"],
        "expires_at": time.time() + body["expires_in"],
    }
    return _token_cache["access_token"]


def _post(path: str, body: str) -> list:
    r = requests.post(
        f"{BASE}{path}",
        data=body,
        headers={
            "Client-ID": os.environ["TWITCH_CLIENT_ID"],
            "Authorization": f"Bearer {_token()}",
            "Accept": "application/json",
        },
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def _cover_url(cover: dict | None) -> str | None:
    if not cover or not cover.get("image_id"):
        return None
    return f"{IMG_BASE}/{cover['image_id']}.jpg"


def _normalize(game: dict) -> dict:
    first_release = game.get("first_release_date")
    year = None
    if first_release:
        year = time.gmtime(first_release).tm_year

    companies = game.get("involved_companies") or []
    developers = [
        c["company"]["name"] for c in companies
        if c.get("developer") and c.get("company", {}).get("name")
    ]
    publishers = [
        c["company"]["name"] for c in companies
        if c.get("publisher") and c.get("company", {}).get("name")
    ]

    return {
        "title": game.get("name") or "",
        "creator": ", ".join(developers) or "Unknown",
        "year": year,
        "content_type": "game",
        "language": "en",  # IGDB doesn't reliably expose original language
        "summary": game.get("summary") or "",
        "genre": [g["name"] for g in game.get("genres", []) if g.get("name")],
        "ongoing": False,
        "actors": None,
        "page_count": None,
        "series_title": None,
        "organization": ", ".join(publishers) or None,
        "cover_url": _cover_url(game.get("cover")),
        "source": "igdb",
        "external_id": f"game:{game['id']}",
    }


def fetch_games(pages: int = 5, page_size: int = 50, sleep_s: float = 0.25) -> list[dict]:
    """Top-rated games with cover art, paginated."""
    out = []
    fields = (
        "name,summary,first_release_date,genres.name,cover.image_id,"
        "involved_companies.developer,involved_companies.publisher,"
        "involved_companies.company.name"
    )
    for page in range(pages):
        body = (
            f"fields {fields};"
            f" where cover != null & total_rating_count > 50;"
            f" sort total_rating desc;"
            f" limit {page_size};"
            f" offset {page * page_size};"
        )
        results = _post("/games", body)
        for game in results:
            out.append(_normalize(game))
        time.sleep(sleep_s)
    return out
