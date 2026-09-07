# Real-Time API & Webhook Health Monitor with AI Diagnostics

A full-stack monitoring platform that pings API endpoints in real time, captures live webhook events with signature verification, and generates AI-powered root cause analysis when something breaks — using Google's Gemini LLM with an automatic rule-based fallback.

**Live demo:** [monitorize-phi.vercel.app](https://monitorize-phi.vercel.app)

> Note: backend services are hosted on Render's free tier and sleep after 15 minutes of inactivity. The first request after idle may take 30–60 seconds to wake up.

---

## Features

- **Real-time endpoint monitoring** — pings each registered API on its own configurable interval, tracks latency, status codes, and uptime percentage
- **Live status dashboard** — up / degraded / down states with color-coded latency charts, updated instantly via WebSockets (no polling)
- **Live webhook inspector** — a real receiver endpoint that accepts incoming webhooks, verifies HMAC-SHA256 signatures, flags schema drift and anomalies, and streams new events to the UI in real time
- **AI root cause analysis** — on-demand diagnosis powered by Gemini, explaining what broke, why, and how to fix it (with a sample code fix), gracefully falling back to rule-based logic if the LLM is unavailable
- **Full CRUD** — add, edit, and delete monitors from the dashboard
- **Dark, developer-tool-styled UI** — responsive from mobile to desktop, with a collapsible sidebar

---

## Architecture

This is a monorepo containing three independently deployed services:

```
monitor-project/
├── app/
│   ├── api-webhook-monitor/   Next.js frontend
│   ├── api-gateway/           Express backend
│   └── ai-service/            FastAPI AI service
```

```
┌─────────────────┐      REST + WebSocket      ┌──────────────────┐
│   Next.js        │ ──────────────────────────▶│   Express          │
│   (Vercel)        │◀──────────────────────────│   (Render)          │
└─────────────────┘                             └────────┬─────────┘
                                                            │
                                          ┌─────────────────┼─────────────────┐
                                          │                                     │
                                   ┌──────▼───────┐                    ┌───────▼────────┐
                                   │   Neon           │                    │   FastAPI          │
                                   │   PostgreSQL      │                    │   (Render)          │
                                   └──────────────┘                    └───────┬────────┘
                                                                                    │
                                                                             ┌──────▼──────┐
                                                                             │   Gemini API  │
                                                                             └─────────────┘
```

- **Frontend** fetches monitor/webhook data on load and listens for live updates over Socket.io
- **Express gateway** owns the database, runs a per-monitor ping loop, verifies webhook signatures, and proxies AI diagnosis requests to FastAPI
- **FastAPI service** builds a diagnosis from context it receives — tries Gemini first, falls back to deterministic rules (5xx, 404, high latency, invalid signature, schema drift) if the LLM call fails or no API key is set

---

## Tech Stack

**Frontend**
- Next.js (App Router), JavaScript/JSX
- Tailwind CSS (dark theme)
- shadcn/ui components
- Recharts (gradient area charts)
- Socket.io-client

**Backend (API Gateway)**
- Express (CommonJS)
- Prisma 7 + PostgreSQL (hosted on Neon)
- Socket.io
- Node's native `fetch` for endpoint pinging and HMAC verification via `crypto`

**AI Service**
- FastAPI (Python)
- Google Gemini (`google-genai` SDK)
- Pydantic for request/response schemas
- Rule-based fallback analyzer

**Infrastructure**
- Vercel (frontend)
- Render (Express + FastAPI)
- Neon (PostgreSQL)

---

## Running Locally

Three services, three terminals.

### 1. Database
Create a free project at [neon.tech](https://neon.tech) and copy the connection string.

### 2. API Gateway
```bash
cd app/api-gateway
npm install
```
Create `.env`:
```
PORT=4000
DATABASE_URL=your-neon-connection-string
WEBHOOK_SECRET=some-dev-secret
AI_SERVICE_URL=http://localhost:8000
```
```bash
npx prisma migrate dev
node prisma/seed.js
npm run dev
```

### 3. AI Service
```bash
cd app/ai-service
python -m venv venv
source venv/Scripts/activate   # or venv/bin/activate on macOS/Linux
pip install -r requirements.txt
```
Create `.env`:
```
GEMINI_API_KEY=your-gemini-api-key
```
```bash
uvicorn main:app --reload --port 8000
```

### 4. Frontend
```bash
cd app/api-webhook-monitor
npm install
```
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```
```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Testing the Webhook Receiver

Generate a valid HMAC signature and send a test event:

```bash
node -e "console.log(require('crypto').createHmac('sha256','some-dev-secret').update('{\"event\":\"test.ping\"}').digest('hex'))"

curl -X POST http://localhost:4000/api/webhooks/incoming/YOUR_MONITOR_ID \
  -H "Content-Type: application/json" \
  -H "X-Signature: PASTE_HASH_HERE" \
  -d "{\"event\":\"test.ping\"}"
```

The event appears instantly on `/webhooks` — no refresh needed.

---

## API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/monitors` | List all monitors |
| GET | `/api/monitors/:id` | Get a single monitor |
| POST | `/api/monitors` | Create a monitor |
| PATCH | `/api/monitors/:id` | Update a monitor |
| DELETE | `/api/monitors/:id` | Delete a monitor |
| GET | `/api/webhooks` | List recent webhook events |
| POST | `/api/webhooks/incoming/:monitorId` | Receive a webhook (HMAC-verified) |
| POST | `/api/webhooks/:id/replay` | Replay a stored event |
| GET | `/api/diagnostics/:monitorId` | Get AI-generated root cause analysis |
| GET | `/api/stats` | Aggregate dashboard stats |

**Socket.io events (emitted by the gateway):**
- `monitor_updated` — fired after every ping check
- `new_webhook` — fired when a webhook is received

---

## Notes

- The AI service tries Gemini first and transparently falls back to rule-based diagnostics if the API key is missing or the call fails — the app never breaks due to LLM unavailability.
- Docker was deliberately excluded due to local disk space constraints; each service can be run and deployed independently without it.
