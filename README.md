# ARTHIVE

ARTHIVE is a unified review and tracking platform for all your media — games, films, TV shows, and books — in one place. Instead of juggling Letterboxd for films, Goodreads for books, and separate apps for everything else, ARTHIVE gives you a single home to log what you've watched, played, and read, write reviews, and build a personal record of your media experiences.

---

## Features

- **Games** — Log games you've played, rate them, and write reviews across any platform or genre
- **Films** — Track movies you've watched, leave ratings and thoughts, and build a personal watchlist
- **TV Shows** — Follow series, track episodes, and review seasons as you go
- **Books** — Record books you've read, rate them, and keep notes on what stuck with you
- **Unified Reviews** — One consistent review format across all media types, so everything lives together
- **Personal Library** — A single profile showing your full history across games, films, TV, and books

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Ruby on Rails 8.1, PostgreSQL, GraphQL  |
| Frontend | React 19, TypeScript, Vite, Apollo Client |

---

## Getting Started

### Prerequisites

- Ruby (see `arthive-backend/Gemfile.lock` for exact version)
- Node.js & npm
- PostgreSQL

---

### Backend

```bash
cd arthive-backend
bundle install
rails db:create db:migrate
rails server
```

The API will be available at `http://localhost:3000`.

---

### Frontend

```bash
cd arthive-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.
