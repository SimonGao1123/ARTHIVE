# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ARTHIVE is a full-stack media tracking platform for books, movies, and TV shows with community features. The repo is a monorepo with two sub-projects:

- `arthive-backend/` — Rails 8.1 GraphQL API (Ruby 3.4.8, PostgreSQL)
- `arthive-frontend/` — React 19 SPA (TypeScript, Vite, Apollo Client)

## Backend Commands

```bash
cd arthive-backend
bin/setup              # Initialize/reset dev environment
bin/rails server       # Start API server at http://localhost:3000
bin/rails test         # Run all tests
bin/rails test test/models/user_test.rb  # Run a single test file
bin/rails test:system  # Run system tests (Capybara/Selenium)
bin/rubocop            # Lint Ruby code
bin/brakeman           # Security static analysis
bin/bundler-audit      # Audit gem vulnerabilities
bin/ci                 # Full CI pipeline (setup, lint, security, tests)
bin/rails db:prepare   # Create and migrate database
bin/rails db:seed:replant  # Reset and re-seed database
```

## Frontend Commands

```bash
cd arthive-frontend
npm install            # Install dependencies
npm run dev            # Dev server at http://localhost:5173
npm run build          # TypeScript check + Vite production build
npm run lint           # ESLint
npm run preview        # Preview production build
```

## Architecture

### API Layer

The backend exposes a **single GraphQL endpoint** at `POST /graphql`. GraphiQL IDE is available at `/graphiql` in development. There are no REST endpoints for domain data — all queries and mutations go through GraphQL.

The GraphQL schema lives in `arthive-backend/app/graphql/`:
- `types/` — 41 type definitions mapping to domain models
- `mutations/` — 18 mutation handlers
- `resolvers/` — 17 resolver classes for complex query logic
- `arthive_backend_schema.rb` — root schema entry point

### Frontend Data Flow

`arthive-frontend/src/main.tsx` bootstraps the app with Apollo Client and React Router. Apollo Client is configured with auth middleware that attaches a JWT token from `localStorage` to every request.

GraphQL operations (queries and mutations) are defined in `src/data/` and consumed by page components in `src/pages/`. Reusable UI components live in `src/lib/`. TypeScript types for the GraphQL schema are in `src/types/`.

### Authentication

JWT tokens are issued by the backend and stored in `localStorage` on the client. The Apollo Client middleware reads from `localStorage` to inject the `Authorization` header on each GraphQL request.

### Core Data Models

The primary models and their relationships:
- **User** — profile, lists, reviews, followers
- **Media** — books/movies/TV shows with metadata
- **Review** — user review with rating
- **List / MediaInList** — user-curated lists with media (junction table)
- **Follow** — user follow graph with request/approval status
- **Community / CommunityThread** — per-media discussion boards with nested threads
- **ReviewComment, ReviewLike, ThreadLike** — engagement on reviews and threads

### File Storage

Active Storage with AWS S3 backend. Signed URLs expire after 1 hour (configured in `config/application.rb`).

### Background Infrastructure

Solid Queue (jobs), Solid Cache (caching), and Solid Cable (WebSockets) are all configured and running on the Rails side.

## Testing

Backend uses Rails fixtures (not factories). System tests use Capybara with Selenium. Run a single test with the full file path passed to `bin/rails test`.

## CI/CD

GitHub Actions runs on every push: lint → security scans → tests (see `.github/workflows/ci.yml`). Deployment uses Kamal with Docker containers.
