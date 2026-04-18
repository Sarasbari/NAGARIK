# NAGARIK नागरिक

**Citizen Infrastructure Monitoring & Smart Dispatch Platform**  
*Hackathon-optimised | Bharat 5.0 | INFRATECH | v1.0*

Nagarik is a next-generation civic intelligence platform designed to shift municipal infrastructure management from **reactive** to **predictive**. By combining citizen crowdsourcing, AI-driven decay prediction, and optimized smart dispatching, Nagarik empowers cities to fix problems *before* they become costly emergencies.

---

## 🏗️ Architecture Flow

![Nagarik Architecture](architecture.jpg)

The platform is designed around a seamless operational loop:

1. **Citizen Mobile App**: A React Native (Expo) app where citizens authenticate (OTP/Aadhaar) and report civic issues with photos and precise GPS tags. Auto-checks for 50m radius duplicates.
2. **Backend API**: Powered by Supabase (PostgreSQL + PostGIS). Handles ward lookup, authentication, and push notifications to citizens as issues are resolved.
3. **AI Processing Pipeline**: 
    - **Image Classifier:** Gemini Vision API assigns a 1-5 severity score.
    - **Decay Predictor:** Analyzes 30-day time-series history to predict where infrastructure covers will fail next.
    - **Route Optimizer:** Greedy nearest-neighbor algorithm dynamically calculates the fastest truck routes.
4. **Government Web Dashboard**: A high-contrast Next.js 14 interface for municipal officers featuring live KPI strips and two primary action modes.

---

## 🚦 Operational Modes

### 🔴 Mode 1: Radar (Predictive AI)
- **Decay Heatmap**: Visualizes high-risk (red/orange) zones where potholes or drainage issues are likely to compound based on overlapping data and severity.
- **Preventive Dispatch**: Click on a critical zone to dispatch a preventive maintenance crew *before* a monsoon or heavy traffic destroys the road surface completely.

### 🟢 Mode 2: Command Center (Active Dispatch)
- **Live Issue Queue**: Sorts confirmed issues by SLA deadlines and algorithmic severity.
- **Smart Routing System**: Officers select a repair truck and hit "Generate Optimal Route". The system calculates the fastest path (TSP algorithm), displays fuel/ETA estimations, and computes a **Ward Equity** percentage to ensure fair maintenance distribution across all city wards.

---

## 🛠️ Tech Stack & Data Models

![Nagarik Tech Stack](tech-stack.jpg)

### Frontend
* **React Native (Expo)**: Single codebase for iOS and Android citizen app.
* **Next.js 14**: Server components and fast builds for the municipal web dashboard.
* **Tailwind CSS**: High-visibility neo-brutalism design language.

### AI & Logic
* **Gemini Vision API**: Zero-cost, high-accuracy image classification and automated JSON severity output.
* **Custom Route Optimizer**: Node.js spatial mathematics module for nearest-neighbor TSP and haul optimization.

### Backend Infrastructure
* **Supabase**: Unified Auth, Database, Storage, and Real-time syncing.
* **PostgreSQL + PostGIS**: Advanced spatial queries to handle proximity grouping and geo-boundary intersections.
* **Expo Push**: Built-in alerting system to keep citizens in the loop effortlessly.

### Maps & Geo
* **React Leaflet**: Heavy-duty map rendering with custom dynamic heat layer overlays.
* **OpenStreetMap**: Free map tiles handling robust city-level zoom performance.

---

## 💾 Core Data Models
* **`Report`**: `id`, `citizen_id`, `issue_type`, `severity_score`, `ward_id`, `lat/lng`
* **`Ward`**: `id`, `geojson_boundary`, `equity_score`, `avg_resolution_days`
* **`Dispatch`**: `mode`, `route_waypoints_json`, `issue_ids[]`

---

*This document serves as the Technical PRD and Hackathon Architecture overview for Nagarik v1.0.*
