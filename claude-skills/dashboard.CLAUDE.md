# 🖥️ Dashboard CLAUDE — Next.js + Leaflet + Neo-Brutal

## Framework
- Next.js 14 App Router — RSC by default
- `'use client'` directive ONLY for interactive components (map, toggles)

## Leaflet Integration
- `react-leaflet` for declarative map components
- `leaflet.heat` for heatmap overlay (dynamic import, client-only)
- Custom divIcon markers with neo-brutal styling

## Neo-Brutalism Design
- 3px solid black borders everywhere
- Hard drop shadows: `4px 4px 0px #1a1a1a`
- Saffron (#FF9933) accent color
- Space Grotesk headings, Inter body text
- No rounded corners on cards — sharp or minimal radius

## Key Components
- `CityMap` — base Leaflet wrapper (Mumbai center)
- `HeatmapLayer` — decay risk overlay
- `IssueMarker` — severity-colored pins
- `BrutalCard` — standard card container
- `KPIStrip` — top bar with live metrics
- `ModeToggle` — route-based mode switcher

## Route Structure
- `/` — city map home
- `/radar` — predictive heatmap
- `/command` — dispatch center (70/30 split)
- `/issues` — SLA-sorted queue
- `/issues/[id]` — detail slide-in panel
- `/equity` — ward equity bar charts
