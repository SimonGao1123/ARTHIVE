"""CLI for fetching media from external APIs into a JSON file.

Usage:
    python fetch.py --source tmdb --type film --pages 5 --out tmdb_films.json
    python fetch.py --source tmdb --type series --pages 3 --out tmdb_series.json
    python fetch.py --source google_books --query "subject:fiction" --pages 5 --out gb_fiction.json
    python fetch.py --source igdb --pages 3 --out igdb_games.json

The Rails side reads the JSON via a rake task and runs Media.create! per row,
which fires the after_create :create_community! callback and attaches the
cover image via ActiveStorage.
"""
import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from fetchers import tmdb, google_books, igdb  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch media metadata into a JSON file")
    parser.add_argument("--source", required=True, choices=["tmdb", "google_books", "igdb"])
    parser.add_argument("--type", choices=["film", "series", "book", "game"],
                        help="Required for tmdb (film|series).")
    parser.add_argument("--query", default="subject:fiction",
                        help="Search query (google_books only)")
    parser.add_argument("--pages", type=int, default=5)
    parser.add_argument("--out", required=True, help="Path to output JSON file")
    args = parser.parse_args()

    if args.source == "tmdb":
        if args.type == "film":
            rows = tmdb.fetch_films(pages=args.pages)
        elif args.type == "series":
            rows = tmdb.fetch_series(pages=args.pages)
        else:
            print("--type film|series is required for tmdb", file=sys.stderr)
            return 1
    elif args.source == "google_books":
        rows = google_books.fetch_books(query=args.query, pages=args.pages)
    elif args.source == "igdb":
        rows = igdb.fetch_games(pages=args.pages)
    else:
        print(f"unknown source: {args.source}", file=sys.stderr)
        return 1

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False))
    print(f"wrote {len(rows)} rows to {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
