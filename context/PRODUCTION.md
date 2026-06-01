# ARTHIVE Production Setup

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    RENDER                            │
│                                                      │
│  ┌─────────────────┐      ┌──────────────────────┐  │
│  │  Static Site    │      │   Web Service        │  │
│  │  (Frontend)     │ ───► │   (Backend)          │  │
│  │                 │      │                      │  │
│  │  React + Vite   │      │  Rails 8 + Puma      │  │
│  │  Tailwind CSS   │      │  GraphQL API         │  │
│  │  Apollo Client  │      │  Docker container    │  │
│  └─────────────────┘      └──────────┬───────────┘  │
│                                       │              │
│                            ┌──────────▼───────────┐  │
│                            │  PostgreSQL          │  │
│                            │  (Render Managed)    │  │
│                            └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
              │                    │
              ▼                    ▼
        ┌──────────┐        ┌──────────────┐
        │  AWS S3  │        │   AWS SQS    │
        │          │        │              │
        │  Profile │        │ Notification │
        │  pics    │        │ queue        │
        │  Media   │        └──────────────┘
        │  images  │
        └──────────┘
```

## Render Services

### 1. Backend — Web Service
- **Runtime**: Docker (auto-detected from `arthive-backend/Dockerfile`)
- **Root directory**: `arthive-backend`
- **Port**: 80
- **Health check path**: `/up`

**Environment Variables:**
| Key | Value |
|---|---|
| `RAILS_ENV` | `production` |
| `RAILS_MASTER_KEY` | value from `config/master.key` |
| `PROD_DATABASE_URL` | Render Postgres internal URL |
| `FRONTEND_URL` | `https://your-frontend.onrender.com` |

### 2. Frontend — Static Site
- **Root directory**: `arthive-frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

**Environment Variables:**
| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

Note: no `/graphql` suffix — `apollo.ts` appends it automatically.

### 3. Database — Render PostgreSQL
- Managed PostgreSQL addon
- Copy the **Internal Database URL** into `PROD_DATABASE_URL` on the backend service

---

## AWS Services

### S3 — File Storage
Used for profile pictures and media images via Active Storage direct uploads.

**How it works:**
1. Frontend requests a presigned URL from Rails (`POST /rails/active_storage/direct_uploads`)
2. Rails generates the signed URL using credentials
3. Frontend uploads directly to S3 using the presigned URL

**S3 CORS configuration** (required — set in AWS S3 console under bucket Permissions → CORS):
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["https://your-frontend.onrender.com"],
    "ExposeHeaders": ["ETag", "Origin", "Content-Type"]
  }
]
```

### SQS — Notification Queue
Used for queuing notifications. Configured via Rails credentials.

---

## Credentials

AWS credentials are stored encrypted in `config/credentials.yml.enc`, decrypted at runtime using `RAILS_MASTER_KEY`. Never stored as plain env vars.

Credentials structure:
```
aws:
  access_key_id: ...
  secret_access_key: ...
  bucket: ...
  region: ...
  sqs_url: ...
```

To edit: `bin/rails credentials:edit`

---

## Auth Flow

1. User logs in → Rails issues JWT
2. JWT stored in browser `localStorage`
3. Every GraphQL request → Apollo attaches JWT in `Authorization: Bearer <token>` header
4. Rails validates JWT on every request

---

## CORS

Only the frontend URL is whitelisted in `config/initializers/cors.rb`. Controlled via `FRONTEND_URL` env var on the backend service.

---

## Deployment

Push to the connected git branch — Render auto-deploys on push.

On first deploy, `bin/docker-entrypoint` runs:
```bash
bin/rails db:create
bin/rails db:migrate
```

No seeds are run in production — data is created through the app.
