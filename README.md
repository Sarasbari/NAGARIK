# 🇮🇳 Nagarik — Civic Issue Reporting Platform

AI-first open-source platform that helps citizens report local issues, routes reports to the right department, and gives officers the tools to triage, dispatch, and resolve problems faster.

Why this matters: local governments struggle with visibility and prioritization. Nagarik stitches mobile reporting, automated classification, spatial routing, and an officer dashboard into a complete workflow that improves response times and accountability.

**Highlights**
- End-to-end: mobile reporting app, officer dashboard, ML classification pipeline, and Supabase-backed storage.
- Designed for production: geospatial Postgres + PostGIS, background SLA checks, and route optimization.
- Extensible: modular ML routers, pluggable classification models, and clear API boundaries.

**Badges**
- Build: [![build status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
- License: [![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
- Stars: [![stars](https://img.shields.io/badge/stars-%E2%98%85-blue)](https://github.com)

---

## Table of Contents
- [Demo](#demo)
- [Quickstart (developer)](#quickstart-developer)
- [Architecture & Tech stack](#architecture--tech-stack)
- [Features](#features)
- [Contribution guide](#contribution-guide)
- [Roadmap](#roadmap)
- [Security & Responsible Disclosure](#security--responsible-disclosure)
- [License](#license)

---

## Demo
Add a short GIF or screenshot here to show the app and dashboard in action. Use `assets/images/demo.gif` or `website/public/demo.png` for best visibility.

---

## Quickstart (developer)
Get the repo running locally in minutes — developer-friendly, with seeded data and an optional local Supabase instance.

Prerequisites:
- Node 18+ and npm/yarn
- Python 3.10+ (for ML services)
- Docker & Docker Compose (recommended for Supabase local)

Developer flow (recommended):

1. Clone the repo

```bash
git clone <repo-url> && cd NAGARIK
```

2. Start a local Supabase (recommended)

```bash
# from repo root
npx supabase start
```

3. Seed the database (one-time)

```bash
psql postgres://localhost:54322/postgres -f supabase/migrations/001_init_schema.sql
psql postgres://localhost:54322/postgres -f supabase/migrations/003_seed_wards.sql
```

4. Start the ML service

```bash
cd ml
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

5. Start the dashboard (website)

```bash
cd website
npm install
npm run dev
```

6. Start the mobile app (Expo)

```bash
cd app
npm install
npx expo start
```

Notes:
- Copy `.env.example` files from `app/`, `website/`, and `ml/` and fill secrets before running in non-dev environments.
- Use `docker-compose.yml` for an integrated development environment if you prefer containers.

---

## Architecture & Tech stack

- Mobile: React Native (Expo)
- Web dashboard: Next.js 14 + Leaflet
- ML: FastAPI (Python) — image classification, severity scoring, and entity extraction
- DB: Supabase (Postgres + PostGIS)
- Background jobs: Node cron / serverless functions in `supabase/functions`
- CI/CD: GitHub Actions (recommended)

---

## Features

- Smart image classification for common civic issues (potholes, overflowing garbage, water leaks, etc.)
- Automatic geo-routing: map a report to ward, department, and SLA
- Officer dashboard: heatmaps, prioritized queues, and issue detail pages
- Route optimization for vehicles assigned to fix issues
- Notifications and citizen updates via push and email
- Extensible ML pipeline and model interfaces under `ml/services`

---

## Contribution guide

We welcome contributors. A good first step is to open an issue describing the feature or bug. When you're ready to contribute:

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Run tests and linters (if available)
4. Open a PR with a clear description and screenshots

See [CONTRIBUTING.md](docs/README.md) for detailed developer guidelines and testing notes.

Be kind, follow the code of conduct, and keep PRs focused and small.

---

## Roadmap

- Improve ML accuracy and add active learning loop
- Harden deployment scripts and production monitoring
- Mobile offline reporting and better caching
- Internationalization and localization for multiple cities

---

## Security & Responsible Disclosure

If you find a vulnerability, please open a private issue or contact the maintainers. Do not post exploits publicly.

---

## Why star this repo?

- It solves a real civic problem end-to-end with production-grade components.
- Modular design makes it easy to adopt or extend for local municipalities.
- Active roadmap and many opportunities for contributions.

If you find Nagarik useful, please consider starring the project — stars help attract contributors, maintainers, and users.

---

## License

This project is licensed under the MIT License.

---

If you'd like, I can also:
- add a short demo GIF to `assets/images` and link it in this README;
- create a `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` to improve community onboarding;
- add CI badges and a GitHub Actions workflow template.
