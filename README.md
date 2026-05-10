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
| API | ASP.NET Core 8 (C#) |
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

## Project Structure

```
autoops-ai/
├── docker-compose.yml
├── .env
├── storage/uploads/
├── backend-csharp/AutoOpsAI/   ← ASP.NET Core API
│   ├── Program.cs
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── DocumentsController.cs
│   │   └── JobsController.cs
│   ├── Models/Models.cs
│   ├── DTOs/DTOs.cs
│   ├── Data/AppDbContext.cs
│   ├── Services/
│   │   ├── TokenService.cs
│   │   └── JobQueueService.cs
│   └── Migrations/
├── backend-python/             ← Python AI Worker only
│   ├── services/
│   │   ├── document_parser.py  ← PDF/DOCX/TXT extraction
│   │   └── ai_pipeline.py      ← Gemini integration
│   └── workers/
│       ├── celery_app.py
│       └── tasks.py
└── frontend/src/
    ├── pages/
    ├── components/
    └── services/
```

---

## Resume Bullet Points

> **AutoOps AI** | React, ASP.NET Core, Python, PostgreSQL, Redis, Celery, Docker, Gemini API
> - Built AI document processing platform with a polyglot microservice architecture — C# ASP.NET Core REST API backed by a Python Celery AI worker communicating via Redis queue
> - Implemented JWT authentication, file upload pipeline, and async job management in ASP.NET Core with Entity Framework Core
> - Designed Redis-backed Celery pipeline processing documents through parse → chunk → analyze stages with real-time SSE progress updates streamed to the React frontend
> - Containerized multi-service architecture using Docker Compose, coordinating ASP.NET Core, Python AI worker, PostgreSQL, Redis, and React across isolated containers
