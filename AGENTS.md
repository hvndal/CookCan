# CookCan — read this file first

If you are an agent, read this whole file before you change the app. It is the shared brief. `CLAUDE.md` points here. Visual rules live in `DESIGN.md`. Firebase setup lives in `FIREBASE.md`. Do not rediscover the product from stale README lines.

Expo SDK 57 has changed. Before you write UI or config, read the versioned docs at https://docs.expo.dev/versions/v57.0.0/.

## What this is

CookCan is an Android kitchen app. Package `com.cookcan.app`. Expo SDK 57, React Native 0.86, React 19.2. The web target is a phone-width preview, not the product.

A cook scans the fridge, scans a written list, or types what they have. Gemini curates recipes from that inventory. Cuisine and goals steer the plate. Tagline: **Scan. Select. Savor.**

It is a private cookbook. There is no social feed and no video wall.

## Do not break these

- The door is **Continue with Google**, **Email me a link**, and a quiet **Continue as guest**. No password field. No phone OTP. No Create Account form. `AuthContext` still has unused `signIn`, `signUp`, and phone helpers. Leave them off `LoginScreen`.
- The page is `SoftWash` (`src/theme/wash.tsx`): blush `#F6C6D2` → cream `#FBF6F1` → sage `#E4F0E2` → lilac `#E6E1F4`. Photos and the sign-in sheet float (`floatShadow`). They do not paint the whole phone.
- Rose `#E18194` is the mark and the one filled action. Primary press is `#A43758`. Ink is `#1B1C1A`.
- Icons are Lucide. Press scale is `0.96` via `BouncePressable`. Do not add a second animation library.
- `BouncePressable` puts `style` on an inner `Animated.View`. A `flex: 1` child needs a wrapping `View` or the tile collapses on web.
- Use `StyleSheet.absoluteFill`. `absoluteFillObject` is missing from the RN types here.
- Guest is the local demo. Do not require a Gemini key or a Firebase console change to walk the app.
- Never commit `.env`, `gemini.env`, or API keys.

## Flow

1. Splash (rose field, logo).
2. Login. Google on web uses `signInWithPopup`. Android uses `@react-native-google-signin` and needs `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Magic link is `sendSignInLinkToEmail` / `signInWithEmailLink`, continue URL from `window.location.origin` on web and `cookcan://` via `Linking.createURL` on device. Email is stored in AsyncStorage under `@cookcan/magic_email`.
3. Guest calls `signInLocal` (default `cook@cookcan.app`).
4. Onboarding: welcome, country, cuisines, goals. Then the kitchen.
5. Tabs: **Home · Pantry · AI Chef · Grocery**.
6. Stack: Scanning (fridge or list), RecipeRefine, RecipeResults, RecipeDetail, MealPlanner, Paywall, Profile, AdminGrant.

`RootNavigator` swaps the stack on `user` and `onboardingDone`. Login unmounts when a session exists.

## Where to edit

| Area | File |
| --- | --- |
| Door | `src/screens/LoginScreen.tsx` |
| Welcome | `src/screens/OnboardingScreen.tsx` |
| Home | `src/screens/HomeScreen.tsx` |
| Tabs | `src/navigation/MainTabs.tsx` |
| Stack | `src/navigation/RootNavigator.tsx` |
| Session | `src/context/AuthContext.tsx` |
| Pantry, recipes, scan quota | `src/context/DataContext.tsx` |
| Play Billing (skipped on web) | `src/context/BillingContext.tsx` |
| Gemini | `src/lib/gemini.ts` |
| Firebase init | `src/lib/firebase.ts` |
| Wash, shadow | `src/theme/wash.tsx` |
| Palette | `src/theme/colors.ts` |
| Photos | `src/theme/photos.ts`, `assets/food/` |
| Logo | `assets/cookcan-logo.jpg`, `src/theme/assets.ts` |
| Motion | `src/theme/motion.tsx` |
| Cuisines and diets | `src/constants/preferences.ts` |
| SKUs and free quota | `src/constants/billing.ts` |
| Copy | `src/i18n/translations.ts` |

## Gemini

`src/lib/gemini.ts` calls `gemini-2.0-flash`. With no `EXPO_PUBLIC_GEMINI_API_KEY`, scan and recipe calls return offline demos: Tomato, Garlic, Olive Oil, Basil, then Skillet Garden Pasta and One-Pan Herb Roast. Say that plainly. Do not claim the live API is running in this environment.

## Auth and data

Firebase project defaults are in `src/lib/firebase.ts` (`cookcan-8f339`). Firestore syncs pantry, recipes, and Pro grants. See `FIREBASE.md`.

Email-link sign-in must be enabled in the Firebase console, and the continue-URL host must be an authorized domain. Until that is on, the door shows the error in the card and guest still works. Google on a signed Android build also needs the web client id and the app SHA-1.

Local pantry and recipes live in AsyncStorage. There is no Supabase client in `src/`. Ignore README lines that still mention Supabase.

## Billing

Free plan: 5 scans per calendar month (`FREE_SCANS_PER_MONTH`). Pro SKUs: `cookcan_pro_monthly`, `cookcan_pro_yearly`, 7-day trial, prices from Play. `expo-iap` runs on Android only. Web skips those native calls. Dev builds without Play can unlock Pro from the paywall.

## How to run and check

```bash
npm install
npm run typecheck
CI=1 EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --web --host lan --port 8081
```

Open http://127.0.0.1:8081. Judge layout at about 412×892, not a stretched desktop. `CI=1` turns off Metro reload, so restart the Expo process by PID after a code change. There is no unit-test script. `npm ci` fails when the lockfile and `package.json` disagree; use `npm install`.

Node 22.13 or newer. Guest needs no secrets.

## Other docs

| File | Use it for |
| --- | --- |
| `DESIGN.md` | Palette, type, motion, what the photography is for |
| `FIREBASE.md` | Enable Google and email link, Firestore rules, admin grants |
| `BUILD_LOCAL.md` | AAB / EAS, never commit env files |
| `PUBLISH.md` | Play Store ship list |
| `PLAY_CONSOLE.md` | Console checklist |
| `README.md` | Human overview and regional prices. Prefer this file when they disagree |

## Still open

- Turn on Firebase **Email link (passwordless)** and add the real continue-URL host.
- Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` for a native Google sign-in build.
- Set `EXPO_PUBLIC_GEMINI_API_KEY` when a live model is required.
- `SoftWash` is on the door, welcome, and home. Pantry, AI Chef, and Grocery are still cream.
