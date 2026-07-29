# CookCan

**Scan. Cook. Enjoy.** — Scan ingredients and generate personalized recipes with Gemini AI.

Expo SDK 57 / React Native app (`com.cookcan.app`) with Google Play Billing subscriptions.

## Plans

| Plan | Price | Scans | Includes |
|------|-------|-------|----------|
| **Free** | $0 | **5 / calendar month** | Home, Pantry, Grocery, saved recipes |
| **CookCan Pro** | Localized monthly | **Unlimited** | AI Chef, Meal planner, unlimited scans |

### Dynamic / regional Pro pricing

Create **one** Play Console subscription product:

- **Product ID:** `cookcan_pro_monthly`

Then set country prices (Play Billing returns the localized price to the app):

| Region | Target |
|--------|--------|
| United States | USD 2.99 |
| Canada | CAD 2.99 |
| Eurozone | EUR 1.99 |
| India | INR 100 |
| Mexico | MXN ~49 |
| Brazil | BRL ~14.99 |
| Other LATAM | local ~USD 1.99–2.99 equivalent |

The paywall always shows `localizedPrice` from `expo-iap` / Play Billing.

## Run locally

```bash
npm install
cp .env.example .env   # set keys
npx expo start
```

### Environment

```bash
EXPO_PUBLIC_GEMINI_API_KEY=...
EXPO_PUBLIC_SUPABASE_URL=https://oczdxcayqkwvriwolclh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Without Supabase keys, use **Continue without account** (local session).  
Without a Gemini key, scan/recipe/chat use rich offline demos so the app stays workable.

### Google Play Billing (Android)

IAP requires a **development build** (not Expo Go):

```bash
npx eas build --profile development --platform android
```

Play Console checklist:

1. App published to at least **internal testing**
2. Subscription `cookcan_pro_monthly` active with base plan + regional prices
3. License testers added
4. App signed with the upload key Play expects

Dev builds without Play: open Paywall → **Unlock Pro (dev / no Play Billing)**.

## App map

- Auth → onboarding (country + diets) → bottom tabs: **Home · Pantry · AI Chef · Grocery**
- Stack: Scan camera, recipe results/detail, meal planner, profile, paywall
- Free scan quota enforced in `DataContext`; Pro unlocks AI Chef + meal planner + unlimited scans

## AI Studio / legacy

Original Android Studio notes and `remix_-cookcan.zip` (Kotlin Compose reference) remain for product UI inspiration. Active codebase is Expo 57.
