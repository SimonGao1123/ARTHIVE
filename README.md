# ARTHIVE

A single platform for tracking books, movies, and TV shows — so you can reflect on your media experiences without switching between apps.

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
