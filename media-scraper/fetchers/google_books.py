"""Google Books fetcher — books.

API key is optional but raises rate limit; without it you get ~1k requests/day.
Output matches the canonical Media shape.
"""
from __future__ import annotations
import os
import time
import requests

BASE = "https://www.googleapis.com/books/v1/volumes"


def _get(**params) -> dict:
    api_key = os.environ.get("GOOGLE_BOOKS_API_KEY")
    if api_key:
        params["key"] = api_key
    # Retry 429s with exponential backoff: 2s, 4s, 8s. Google occasionally
    # throttles even with a valid key during bursts.
    for attempt in range(3):
        r = requests.get(BASE, params=params, timeout=30)
        if r.status_code == 429 and attempt < 2:
            time.sleep(2 ** (attempt + 1))
            continue
        r.raise_for_status()
        return r.json()
    r.raise_for_status()
    return r.json()


def _normalize(item: dict) -> dict | None:
    info = item.get("volumeInfo", {})
    title = info.get("title")
    if not title:
        return None

    published = info.get("publishedDate") or ""
    authors = info.get("authors") or ["Unknown"]
    images = info.get("imageLinks") or {}
    cover = (
        images.get("extraLarge")
        or images.get("large")
        or images.get("medium")
        or images.get("thumbnail")
        or images.get("smallThumbnail")
    )
    # Google's image URLs ship with `http:`; force https for browser safety.
    if cover and cover.startswith("http://"):
        cover = "https://" + cover[len("http://") :]

    return {
        "title": title,
        "creator": ", ".join(authors),
        "year": int(published[:4]) if published[:4].isdigit() else None,
        "content_type": "book",
        "language": info.get("language") or "en",
        "summary": info.get("description") or "",
        "genre": info.get("categories") or [],
        "ongoing": False,
        "actors": None,
        "page_count": info.get("pageCount"),
        "series_title": None,
        "organization": info.get("publisher"),
        "cover_url": cover,
        "source": "google_books",
        "external_id": f"book:{item['id']}",
    }


def fetch_books(query: str = "subject:fiction", pages: int = 5, page_size: int = 20, sleep_s: float = 0.25) -> list[dict]:
    """Search results for a query, paginated.

    Query examples:
        "subject:fiction"      - any fiction
        "subject:science"      - non-fiction science
        "inauthor:tolkien"     - by author
        "intitle:dune"         - title match
    """
    out = []
    for page in range(pages):
        data = _get(q=query, startIndex=page * page_size, maxResults=page_size)
        for item in data.get("items", []):
            row = _normalize(item)
            if row:
                out.append(row)
        time.sleep(sleep_s)
    return out
