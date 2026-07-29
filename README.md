# CookCan

**Scan. Cook. Enjoy.** — Scan ingredients and generate personalized recipes with Gemini AI.

Expo SDK 57 / React Native app (`com.cookcan.app`) with Google Play Billing subscriptions.

## Plans

| Plan | Price | Scans | Includes |
|------|-------|-------|----------|
| **Free** | $0 | **5 / calendar month** | Home, Pantry, Grocery, saved recipes |
| **CookCan Pro Monthly** | Localized | **Unlimited** | AI Chef, Meal planner, unlimited scans |
| **CookCan Pro Yearly** | Localized (~2 months free) | **Unlimited** | Same as monthly |

Both Pro plans include a **7-day free trial** (configure the offer in Play Console).

### What is a product ID / SKU?

A **SKU** (`cookcan_pro_monthly`, `cookcan_pro_yearly`) is the catalog code Google Play uses for each subscription. You create those products in Play Console; the app only references the IDs and displays whatever localized price Play returns.

### Dynamic / regional Pro pricing

Create these Play Console subscriptions:

- `cookcan_pro_monthly`
- `cookcan_pro_yearly`

Attach a **7-day free trial** offer on both.

| Region | Monthly | Yearly (~2 mo free) |
|--------|---------|---------------------|
| United States | USD 2.99 | USD 29.99 |
| Canada | CAD 2.99 | CAD 29.99 |
| Eurozone | EUR 1.99 | EUR 19.99 |
| India | INR 100 | INR 999 |
| Mexico | MXN ~49 | MXN ~449 |
| Brazil | BRL ~14.99 | BRL ~149.99 |
| Other LATAM | local monthly | ~10× monthly |

The paywall always shows `localizedPrice` / `localizedYearlyPrice` from `expo-iap` / Play Billing.


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
