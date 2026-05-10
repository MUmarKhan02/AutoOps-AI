# AutoOps AI

AI-powered document processing platform with a polyglot microservice architecture.

## Architecture

```
React Frontend (Vite + TypeScript)
          ↓
ASP.NET Core API (C#)        ← REST API, JWT auth, file upload
          ↓
      Redis Queue
          ↓
Python AI Worker (Celery)    ← Document parsing + Gemini AI
          ↓
    PostgreSQL (shared)
```

## Stack

| Service | Technology |
|---------|-----------|
| API | ASP.NET Core 10 (C#) |
| AI Worker | Python + Celery + Redis |
| AI Model | Gemini 2.5 Flash |
| Database | PostgreSQL + Entity Framework Core |
| Frontend | React + Vite + TypeScript + Tailwind + Zustand |
| Infrastructure | Docker + Docker Compose |

---

## Quick Start

```bash
git clone <your-repo>
cd autoops-ai
cp .env.example .env   # add your GEMINI_API_KEY
docker compose up --build
```

Open **http://localhost:5173**

---

## API Endpoints (ASP.NET Core)

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Current user |

### Documents
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/documents/upload` | Upload file, create job |
| GET | `/api/documents/` | List documents |

### Jobs
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/jobs/` | List jobs |
| GET | `/api/jobs/{id}` | Job details |
| GET | `/api/jobs/{id}/result` | AI result |
| GET | `/api/jobs/{id}/stream` | SSE live status |

---
