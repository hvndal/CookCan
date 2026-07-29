# CookCan — Publishable release plan

Goal: ship a **store-ready Android (Play) app** that runs end-to-end: auth → scan → recipes → Pro billing.

## Pricing (configured in Play Console)

| Market | Monthly | Yearly (~2 mo free) |
|--------|---------|---------------------|
| US | $2.99 | $29.99 |
| CA | CA$2.99 | CA$29.99 |
| Eurozone | €1.99 | €19.99 |
| India | ₹100 | ₹999 |
| **LATAM (~USD 1.50)** | MX$29 · R$8.99 · AR$1500 · COL$5990 · CLP$1490 · S/5.99 | ~10× monthly |

SKUs: `cookcan_pro_monthly`, `cookcan_pro_yearly` · **7-day free trial** on both · AI Chef **Pro-only**.

---

## Phase checklist

### 1. App identity & assets — DONE in repo
- [x] Brand splash + adaptive icons (OG rose/sage palette)
- [x] Logo-based Play feature graphic (`assets/feature-graphic.png` 1024×500)
- [x] Store / promo thumbnails (`assets/store-thumbnail.png`, `assets/promo-thumbnail.png`)
- [x] Package `com.cookcan.app`
- [x] Camera / billing permissions
- [x] Locale-aware UI (EN/PT/ES/FR/DE) · India forced English · one-tap Switch to English
- [x] Local currency price display by detected country (e.g. Brazil → R$)
- [x] Cuisine + dietary preference onboarding (Italian/Indian/Japanese… + keto/vegan/gluten-free…)
- [x] Google + email Firebase auth · guest fallback
- [x] Scan → refine mood → thinking loader → curated recipes → cooking mode
- [ ] Replace placeholder `extra.eas.projectId` after `eas init`
- [ ] Host real Privacy Policy + Terms URLs (update `app.json` → `extra`)

### 2. Product code — mostly DONE
- [x] Tabs: Home · Pantry · AI Chef · Grocery
- [x] Scan quota (5 free / month) + paywall
- [x] Gemini scan/recipes/chat (demo fallback without key)
- [x] Local guest auth if Firebase unset
- [ ] Wire production `EXPO_PUBLIC_GEMINI_API_KEY` + Firebase config via EAS Secrets (see `FIREBASE.md`)
- [ ] Optional: Google Sign-In (plugin removed until configured)

### 3. Google Play Billing — Console work (you)
1. Create app `com.cookcan.app` in Play Console  
2. Create subscriptions:
   - `cookcan_pro_monthly`
   - `cookcan_pro_yearly`
3. Set **country prices** using the table above (LATAM ≈ $1.50)  
4. Add **7-day free trial** offer on each base plan  
5. Add license testers  
6. Upload an **internal testing** AAB before real purchases work  

### 4. Build & submit
```bash
npm i -g eas-cli
eas login
eas init                 # paste projectId into app.json extra.eas.projectId
eas secret:create --name EXPO_PUBLIC_GEMINI_API_KEY --value ...
eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value ...
# See FIREBASE.md for all Firebase + admin env vars

# Internal / QA APK
eas build --profile preview --platform android

# Play production AAB
eas build --profile production --platform android
eas submit --profile production --platform android
```

### 5. Store listing copy (draft)
- **Title:** CookCan  
- **Short:** Scan ingredients. Cook with Gemini. Enjoy.  
- **Full:** CookCan turns your fridge into dinner plans. Scan ingredients, generate personalized recipes, manage pantry & grocery lists, and unlock AI Chef + meal planning with CookCan Pro.  
- **Category:** Food & Drink  
- **Content rating:** Everyone  
- Screenshots: Home, Scan, Recipe, Paywall, AI Chef (Pro)

### 6. Legal / compliance
- [ ] Privacy policy live (camera, photos, Gemini processing, Play Billing, account data)
- [ ] Terms of use + subscription auto-renew disclosure  
- [ ] Data safety form in Play Console  
- [ ] Support email monitored (`support@cookcan.app` placeholder)

### 7. Pre-launch QA
- [ ] Cold start → splash → login/guest → onboarding → tabs  
- [ ] 5 free scans then paywall  
- [ ] Gallery scan without crash (with & without Gemini key)  
- [ ] Pro trial purchase (license tester) monthly + yearly  
- [ ] Restore purchases  
- [ ] AI Chef locked on Free, open on Pro  
- [ ] Airplane mode: local pantry/recipes still load  

---

## What you must provide (outside the repo)
1. EAS account + `eas init` project id  
2. Gemini API key  
3. Supabase project (or keep guest-only for first launch)  
4. Play Console developer account  
5. Hosted privacy/terms pages  
6. Final store screenshots (phone frames)

## Current code entry points
- App shell: [`App.tsx`](App.tsx)  
- Billing: [`src/constants/billing.ts`](src/constants/billing.ts), [`src/context/BillingContext.tsx`](src/context/BillingContext.tsx)  
- Navigation: [`src/navigation/RootNavigator.tsx`](src/navigation/RootNavigator.tsx)
