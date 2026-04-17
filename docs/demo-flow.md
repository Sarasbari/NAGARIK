# 🎬 Nagarik Demo Flow — 6 Steps

## Step 1: Citizen Onboarding (30s)
- Open Nagarik app → Saffron splash screen
- Enter phone number → Receive OTP → Verify
- Land on Home screen: "Your city, your voice"

## Step 2: Report an Issue (45s)
- Tap "📸 Report Issue"
- Camera opens with GPS indicator (green = ready)
- Take photo of a pothole on the road
- Select issue type from bottom sheet → "Pothole"
- Report submitted with confirmation animation

## Step 3: AI Classification (15s)
- Backend receives image + GPS coordinates
- Gemini Vision API classifies: **Pothole, Severity 4/5**
- Auto-routed: **K-East Ward → Roads Department**
- Duplicate check: No existing report within 50m ✅

## Step 4: Officer Dashboard — Map View (45s)
- Open dashboard → KPI strip: 127 open, 8 SLA breaches
- City map shows new pothole pin (red, severity 4)
- Toggle to Radar mode → Heatmap shows high-risk areas
- Identify cluster in K-East ward

## Step 5: Dispatch (30s)
- Switch to Command Center mode
- Optimized route calculated: 4 stops, 2.5km
- Assign Truck #01 (Ramesh, idle)
- Confirm dispatch → Route appears on map
- Citizen receives push notification: "Crew dispatched!"

## Step 6: Resolution & Equity (30s)
- Track progress on citizen app: timeline view
- Officer marks issue as resolved
- Citizen receives "Resolved ✅" notification
- Equity page shows K-East ward at 92% equity score
- Fair resource allocation across all wards

---

**Total Demo Time: ~3 minutes**

## Key Talking Points
- 🤖 AI-first: No manual classification needed
- ⚡ < 5 seconds from photo to classification
- 🗺️ Real-time visibility for officers
- ⚖️ Equity scoring ensures fair resource allocation
- 🔔 Citizens stay informed at every step
