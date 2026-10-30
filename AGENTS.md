# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Cursor Cloud specific instructions

- Node.js 22.13 or newer is required (Expo SDK 57). Dependencies install with `npm install` from the repo root. `npm ci` only works when `package-lock.json` matches `package.json`.
- Web dev server (no Android SDK or Expo Go): `CI=1 EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --web --host lan --port 8081`. The app is at http://127.0.0.1:8081.
- Guest use does not need secrets. Leave `EXPO_PUBLIC_GEMINI_API_KEY` unset for offline recipe demos. Firebase web config has in-repo defaults; cloud sync still needs a real Firebase project.
- `npm run typecheck` runs `tsc --noEmit`. There is no unit-test script.
- Play Billing (`expo-iap`) only works in an Android development build. The web bundle skips those native calls.
