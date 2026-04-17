# 📱 Mobile CLAUDE — Expo Patterns

## Navigation
- React Navigation native-stack
- 5 screens: Splash → Home → Camera → IssueType → Tracking
- No tab bar — linear flow with back navigation

## State Management
- Zustand stores: `authStore` (OTP flow), `reportStore` (issue CRUD)
- No Redux — keep it lightweight

## Camera + GPS
- Use `expo-camera` CameraView API (not deprecated Camera)
- Always request location before capture
- GPS indicator overlay on camera screen

## Push Notifications
- Register Expo push token on auth
- Store token in Supabase `profiles` table
- Handle foreground + background notifications

## Styling
- React Native StyleSheet — no NativeWind/Tailwind
- Saffron (#FF9933) as primary color
- Bold neo-brutalism with 3px borders
- Safe area handling via react-native-safe-area-context
