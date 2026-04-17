# 🇮🇳 Nagarik — Full Stack Overview

## What is Nagarik?
AI-powered civic issue reporting platform for Indian cities.
Citizens photograph issues → AI classifies & routes → Officers dispatch → Resolution tracked.

## Architecture
- **app/** → React Native (Expo) — public citizen app (issue reporting)
- **website/** → Next.js 14 — government officer dashboard
- **ml/** → Python FastAPI ML classification pipeline
- **supabase/** → Postgres + PostGIS + Edge Functions

## Data Flow
1. Citizen captures photo + GPS → POST /classify (AI)
2. AI returns: issue_type, severity, ward, department
3. Report saved to Supabase `reports` table
4. Dashboard live-updates via Supabase Realtime
5. Officer dispatches truck → route optimized
6. Status change triggers push notification to citizen

## Key Conventions
- **State**: Zustand (mobile), React Server Components (dashboard)
- **Styling**: React Native StyleSheet (mobile), Tailwind + neo-brutalism (dashboard)
- **Auth**: Supabase phone OTP
- **API**: FastAPI + Pydantic v2
- **DB**: PostgreSQL + PostGIS via Supabase
- **Real-time**: Supabase Realtime channels
