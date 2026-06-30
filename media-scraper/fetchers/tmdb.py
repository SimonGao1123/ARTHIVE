"""TMDB fetcher — films and TV series.

Output rows match the canonical Media shape consumed by the Rails rake task:
    title, creator, year, content_type, language, summary, genre (list),
    ongoing, actors (list), page_count, series_title, organization,
    cover_url, source, external_id
"""
from __future__ import annotations
import os
import time
import requests

BASE = "https://api.themoviedb.org/3"
IMG_BASE = "https://image.tmdb.org/t/p/w500"


def _get(path: str, **params) -> dict:
    api_key = os.environ["TMDB_API_KEY"]
    r = requests.get(f"{BASE}{path}", params={"api_key": api_key, **params}, timeout=30)
    r.raise_for_status()
    return r.json()


def _director(credits: dict) -> str:
    crew = credits.get("crew", [])
    director = next((c["name"] for c in crew if c.get("job") == "Director"), None)
    return director or "Unknown"


def _creators(tv_details: dict) -> str:
    creators = tv_details.get("created_by", [])
    if creators:
        return ", ".join(c["name"] for c in creators)
    return "Unknown"


def _cover_url(poster_path: str | None) -> str | None:
    return f"{IMG_BASE}{poster_path}" if poster_path else None


def _normalize_film(detail: dict, credits: dict) -> dict:
    release = detail.get("release_date") or ""
    return {
        "title": detail.get("title") or "",
        "creator": _director(credits),
        "year": int(release[:4]) if release[:4].isdigit() else None,
        "content_type": "film",
        "language": detail.get("original_language") or "en",
        "summary": detail.get("overview") or "",
        "genre": [g["name"] for g in detail.get("genres", [])],
        "ongoing": False,
        "actors": [c["name"] for c in credits.get("cast", [])[:10]],
        "page_count": None,
        "series_title": None,
        "organization": None,
        "cover_url": _cover_url(detail.get("poster_path")),
        "source": "tmdb",
        "external_id": f"film:{detail['id']}",
    }


def _normalize_series(detail: dict, credits: dict) -> dict:
    first_air = detail.get("first_air_date") or ""
    in_production = detail.get("in_production", False)
    return {
        "title": detail.get("name") or "",
        "creator": _creators(detail),
        "year": int(first_air[:4]) if first_air[:4].isdigit() else None,
        "content_type": "series",
        "language": detail.get("original_language") or "en",
        "summary": detail.get("overview") or "",
        "genre": [g["name"] for g in detail.get("genres", [])],
        "ongoing": bool(in_production),
        "actors": [c["name"] for c in credits.get("cast", [])[:10]],
        "page_count": None,
        "series_title": None,
        "organization": None,
        "cover_url": _cover_url(detail.get("poster_path")),
        "source": "tmdb",
        "external_id": f"series:{detail['id']}",
    }


def fetch_films(pages: int = 5, sleep_s: float = 0.25) -> list[dict]:
    """Top-popular films, paginated. Each page yields ~20 items."""
    out = []
    for page in range(1, pages + 1):
        listing = _get("/movie/popular", page=page)
        for entry in listing.get("results", []):
            detail = _get(f"/movie/{entry['id']}")
            credits = _get(f"/movie/{entry['id']}/credits")
            out.append(_normalize_film(detail, credits))
            time.sleep(sleep_s)
    return out


def fetch_series(pages: int = 5, sleep_s: float = 0.25) -> list[dict]:
    """Top-popular TV series, paginated."""
    out = []
    for page in range(1, pages + 1):
        listing = _get("/tv/popular", page=page)
        for entry in listing.get("results", []):
            detail = _get(f"/tv/{entry['id']}")
            credits = _get(f"/tv/{entry['id']}/credits")
            out.append(_normalize_series(detail, credits))
            time.sleep(sleep_s)
    return out
