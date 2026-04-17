# 🖥️ Nagarik Dashboard — Officer Web Dashboard

## Surface
Next.js 14 App Router dashboard for municipal officers.

## Tech Stack
- **Framework**: Next.js 14 (App Router, RSC)
- **Styling**: Tailwind CSS + neo-brutalism design system
- **Map**: Leaflet + react-leaflet + leaflet.heat
- **Backend**: Supabase SSR client
- **Icons**: lucide-react

## Design System: Neo-Brutalism
- 3px black borders, hard drop shadows
- Bold chunky typography
- High-contrast color palette
- Responsive but desktop-first

## Page Map
| Route | Mode | Description |
|-------|------|-------------|
| `/` | Default | City map + mode toggle |
| `/radar` | Radar | Predictive heatmap overlay |
| `/command` | Command | Dispatch center + route optimizer |
| `/issues` | Queue | Issue list sorted by SLA urgency |
| `/issues/[id]` | Detail | Slide-in panel for single issue |
| `/equity` | Equity | Ward-level resource equity chart |

## Key Patterns
- Real-time subscriptions via Supabase channels
- Server Components for data fetching, Client Components for map/interactivity
- Greedy nearest-neighbor route optimization
- Ward boundary matching via PostGIS/GeoJSON
- 30-day rolling equity scoring

## Commands
```bash
npm install
npm run dev
```
