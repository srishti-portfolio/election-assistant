# ElectIQ — Interactive Election Education Assistant

> A nonpartisan, AI-powered civic education platform that helps users understand
> elections, timelines, voter steps, and key democratic concepts —
> built with React, FastAPI, and Google Gemini.

---

## Chosen Vertical

**Civic Education / Election Process Assistant**

ElectIQ helps citizens — especially first-time voters — understand how elections
work in the United States. It covers the full election lifecycle from candidate
filing through inauguration, provides an interactive voter registration checklist,
defines key terms, and answers natural language questions via AI.

---

## Google Services Used

| Service                        | How It's Used                                                                                     |
|-------------------------------|---------------------------------------------------------------------------------------------------|
| **Google Gemini 1.5 Flash**   | Powers the AI chat assistant (`/api/chat`). Nonpartisan answers + dynamic follow-up suggestions. |
| **Google Cloud Translate API**| Translates text (`/api/translate`) for non-English speakers.                                     |
| **Google Calendar (Links)**   | Each timeline phase has an "Add to Google Calendar" deep-link button.                            |
| **Google Cloud Run**          | Both frontend and backend deployed as containerized Cloud Run services.                          |
| **Google Container Registry** | Docker images stored in GCR for Cloud Run deployments.                                           |

---

## Architecture
┌─────────────────────────────────────────────────────────┐
│           Google Cloud  │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │  Cloud Run  │ │  Cloud Run     │ │
│  │  Frontend   │─────▶  │ Backend (FastAPI)        │ │
│  │  (React + Nginx)  ││ /api/chat  → Gemini AI  │ │
│  └──────────────────┘      │  /api/translate → GCT    │ │
│                             │  /api/timeline (static)  │ │
│                             │  /api/voter-steps  │ │
│                             │  /api/glossary    │ │
│                             └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

---

## Local Development

### 1. Clone & configure
```bash
git clone https://github.com/YOUR_USERNAME/election-assistant.git
cd election-assistant
echo "GEMINI_API_KEY=your_key_here" > .env
```

### 2. Run backend
```bash
cd backend
pip install -r requirements.txt
GEMINI_API_KEY=your_key uvicorn main:app --reload --port 8080
# Docs: http://localhost:8080/docs
```

### 3. Run frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

### 4. Docker Compose (both at once)
```bash
GEMINI_API_KEY=your_key docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

---

## Deploy to Cloud Run

```bash
export GCP_PROJECT_ID=your-project-id
export GEMINI_API_KEY=your-gemini-api-key
chmod +x deploy.sh && ./deploy.sh
```

### GitHub Actions secrets required

| Secret           | Value                                            |
|-----------------|--------------------------------------------------|
| `GCP_PROJECT_ID` | Your GCP project ID                             |
| `GCP_SA_KEY`     | Service account JSON key (Cloud Run + GCR perms)|
| `GEMINI_API_KEY` | Your Gemini API key                             |

---

## API Reference

| Method | Endpoint           | Description                    |
|--------|--------------------|--------------------------------|
| GET    | `/`                | Root health check              |
| GET    | `/health`          | Status + Gemini config         |
| GET    | `/api/timeline`    | Election timeline phases       |
| GET    | `/api/voter-steps` | 8 voter steps                  |
| GET    | `/api/glossary`    | Election term definitions      |
| POST   | `/api/chat`        | AI chat via Gemini             |
| POST   | `/api/translate`   | Text translation via GCT       |

---

## Running Tests

```bash
cd backend
pip install pytest httpx
pytest tests/ -v
```

---

## Assumptions

1. US-centric content — extendable to other countries.
2. App works in demo mode without a Gemini API key.
3. Google Translate requires a GCP service account with Translate API enabled.
4. Conversation history maintained client-side — no database required.
5. Cloud Run min-instances = 0 (scale to zero) to minimize hackathon costs.
6. Single branch (`main`) per contest requirements.

---

## Evaluation Criteria

| Criteria          | Implementation                                                                 |
|------------------|--------------------------------------------------------------------------------|
| Code Quality      | TypeScript, Pydantic models, clean module separation                          |
| Security          | API keys via env vars only, CORS configured, credentials in `.gitignore`      |
| Efficiency        | Static data without AI calls, Gemini only for chat, scale-to-zero Cloud Run   |
| Testing           | Pytest suite for all endpoints, TypeScript type-check in CI                   |
| Accessibility     | Semantic HTML, keyboard navigation, color contrast, mobile-responsive         |
| Google Services   | Gemini AI, Translate API, Calendar links, Cloud Run, Container Registry       |

---

## 🌐 Live Demo

**App:** https://electiq-frontend-441154146170.us-central1.run.app

**Backend API Docs:** https://electiq-backend-441154146170.us-central1.run.app/docs

> The app may take ~10 seconds to wake up on first visit (Cloud Run scales to zero).


## License

MIT — Built for the hackathon. Civic data sourced from public US government information.