# 🏛️ NAGARIK — Civic Infrastructure Reporting Platform

A mobile-first civic issue reporting app for Indian municipalities. Citizens photograph issues (potholes, garbage, waterlogging), and an AI-powered ML service validates and classifies them before storing in the database.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Expo App   │────▶│  Supabase    │     │  FastAPI ML  │
│  (React     │     │  (Auth, DB,  │     │  (Gemini 1.5 │
│   Native)   │────▶│   Storage)   │     │   Flash)     │
└─────────────┘     └──────────────┘     └──────────────┘
       │                                        ▲
       └────────────────────────────────────────┘
                    POST /analyze
```

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `supabase/migration.sql` → click **Run**
3. Go to **Authentication** → **Providers** → enable **Google**
   - Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Set the redirect URL to: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Paste Client ID and Client Secret into the Supabase Google provider config
4. Copy your **Project URL** and **anon key** from **Settings** → **API**

### 2. ML Service

```bash
cd ml

# Create virtual environment
python -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API Key
# Edit ml/.env and add your key:
# GEMINI_API_KEY=your_actual_key

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The ML service will be available at `http://localhost:8000`. Test with:
```bash
curl http://localhost:8000/health
```

#### Docker (alternative)
```bash
cd ml
docker build -t nagarik-ml .
docker run -p 8000:8000 --env-file .env nagarik-ml
```

### 3. Mobile App

```bash
cd nagarik-app

# Install dependencies
npm install

# Configure environment
# Edit .env with your values:
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# EXPO_PUBLIC_ML_URL=http://YOUR_LAN_IP:8000

# Start Expo
npm start
```

> **Important:** If testing on a physical device, use your computer's LAN IP
> (e.g., `192.168.x.x`) for `EXPO_PUBLIC_ML_URL`, not `localhost`.
> Find it with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

Scan the QR code with Expo Go to launch the app.

## Environment Variables

### nagarik-app/.env
| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `EXPO_PUBLIC_ML_URL` | ML service URL (use LAN IP for physical devices) |

### ml/.env
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key for Gemini 1.5 Flash |

## App Flow

1. **Login** → Google OAuth via Supabase
2. **Report** → Take photo → Select category → Describe → Submit
   - Image uploads to Supabase Storage
   - ML service validates with Gemini Vision AI
   - If accepted: saved to DB with severity rating
   - If rejected: image deleted, user notified with reason
3. **History** → View your past reports with status badges and severity indicators

## Project Structure

```
nagarik-app/
├── app/
│   ├── _layout.tsx         # Root layout with auth guard
│   ├── index.tsx           # Redirect to login or tabs
│   ├── login.tsx           # Google sign-in screen
│   └── (tabs)/
│       ├── _layout.tsx     # Bottom tab navigator
│       ├── report.tsx      # Report issue screen
│       └── history.tsx     # Past reports list
├── lib/
│   ├── supabase.ts         # Supabase client config
│   └── ml.ts               # ML service bridge function
├── hooks/
│   └── useSession.ts       # Auth session hook
└── supabase/
    └── migration.sql       # Database schema + RLS

ml/
├── main.py                 # FastAPI app
├── routers/analyze.py      # POST /analyze endpoint
├── services/
│   ├── gemini_analyzer.py  # Gemini vision analysis
│   └── gps_extractor.py    # EXIF GPS extraction (utility)
├── requirements.txt
├── Dockerfile
└── .env                    # GEMINI_API_KEY
```

## Tech Stack

- **Mobile**: React Native + Expo SDK 51 + expo-router
- **Auth/DB/Storage**: Supabase
- **AI/ML**: Google Gemini 1.5 Flash (Vision)
- **Backend**: Python FastAPI
