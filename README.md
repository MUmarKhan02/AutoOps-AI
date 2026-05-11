# AutoOps AI

AI-powered document processing platform with a polyglot microservice architecture.

---

## Live Demo

**[https://auto-ops-ai-mu.vercel.app/](https://auto-ops-ai-mu.vercel.app/)**


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
| API | ASP.NET Core 10 (C#) + Entity Framework Core|
| AI Worker | Python + Celery + Redis |
| AI Model | Gemini 2.5 Flash |
| Database | PostgreSQL |
| Frontend | React + Vite + TypeScript + Tailwind + Zustand |
| Infrastructure | Docker + Docker Compose |
| Deployment | Vercel (frontend), Railway (API, worker, PostgreSQL, Redis) |

---

## Quick Start

```bash
git clone https://github.com/MUmarKhan02/AutoOps-AI
cd AutoOps-AI
cp .env.example .env   # add your GEMINI_API_KEY
docker compose up --build
```

Open **http://localhost:5173**

---

## Features

- JWT Authentication — register, login, access + refresh token flow with backend password validation
- Document Upload — PDF, DOCX, and TXT support up to 20MB
- Async Job Queue — Redis-backed Celery workers process documents without blocking the API
- Real-time Progress — Server-Sent Events (SSE) stream live stage updates (parsing → chunking → analyzing → completed)
- AI Processing — Gemini 2.5 Flash generates summaries and extracts structured key-value data
- Job History — full processing history with result detail view

---
