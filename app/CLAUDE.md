# 📱 Nagarik Mobile — Citizen App

## Surface
React Native (Expo) citizen-facing app for reporting civic issues.

## Tech Stack
- **Framework**: Expo SDK 50 + React Native 0.73
- **Navigation**: React Navigation (native-stack)
- **State**: Zustand
- **Backend**: Supabase JS client + Axios for AI pipeline
- **Camera**: expo-camera
- **Location**: expo-location
- **Notifications**: expo-notifications

## Screen Flow
1. `SplashScreen` → Saffron background + OTP input
2. `HomeScreen` → "Report Issue" CTA + My Reports list
3. `CameraScreen` → Native camera + GPS indicator overlay
4. `IssueTypeScreen` → Bottom sheet: Pothole / Garbage / Drainage / etc.
5. `TrackingScreen` → Status tracker timeline (Submitted → In Progress → Resolved)

## Key Patterns
- OTP auth via Supabase phone auth
- GPS auto-tagging on camera capture
- Optimistic UI updates via Zustand
- Push notifications for status changes

## Commands
```bash
npm install
npx expo start
```
