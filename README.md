# 🇮🇳 Nagarik — Civic Issue Reporting Platform

> AI-powered citizen reporting → officer dashboard → field dispatch → resolution tracking

## Architecture

| Surface | Tech | Port |
|---------|------|------|
| **Citizen App** | React Native (Expo) | — |
| **Officer Dashboard** | Next.js 14 + Leaflet | 3000 |
| **AI Pipeline** | FastAPI + Gemini Vision | 8000 |
| **Database** | Supabase (Postgres + PostGIS) | 54322 |

## Quick Start

```bash
# 1. Clone & install
git clone <repo-url> && cd nagarik

# 2. Setup environment
cp app/.env.example app/.env
cp website/.env.example website/.env
cp ai/.env.example ai/.env

# 3. Start Supabase local
npx supabase start

# 4. Start AI pipeline
cd ai && pip install -r requirements.txt && uvicorn src.main:app --reload

# 5. Start citizen app (mobile)
cd app && npm install && npx expo start

# 6. Start government website (dashboard)
cd website && npm install && npm run dev
```

## Project Structure

```
nagarik/
├── app/                 # 📱 React Native (Expo) — Public Citizen App
├── website/             # 🏛️ Next.js 14 — Government Officer Dashboard
├── ai/                  # 🤖 Python FastAPI — AI Pipeline
├── supabase/            # 🗄️ DB schema + edge functions
├── claude-skills/       # AI coding assistant context
├── docs/                # presentation assets
├── docker-compose.yml
└── README.md
```

## Flow

1. **Citizen** opens app → snaps photo of issue (pothole, garbage, etc.)
2. **AI Pipeline** classifies issue type + severity via Gemini Vision
3. **Auto-routing** maps GPS → ward → department
4. **Dashboard** shows officers a live map + issue queue sorted by SLA
5. **Dispatch** optimizes truck routes (nearest-neighbor)
6. **Citizen** gets push notifications on status changes

## Key Features

- 📸 AI-powered issue classification (Gemini Vision + YOLOv8 fallback)
- 🗺️ Real-time officer dashboard with heatmaps and dispatch
- ⚡ Auto-routing: GPS → ward → department
- 📊 Ward equity scoring for fair resource allocation
- 🔔 Push notifications on status changes
- ⏰ SLA breach monitoring with cron-based alerts

## License

MIT