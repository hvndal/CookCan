# Google Play — CookCan launch (verified account)

## 1. Create app
- Package: `com.cookcan.app` (must match `app.json`)
- Category: Food & Drink

## 2. Subscriptions (Monetize → Products → Subscriptions)

Create **two** products with these exact IDs:

| Product ID | Base plan | Trial | Prices (examples) |
|------------|-----------|-------|-------------------|
| `cookcan_pro_monthly` | Monthly | 7 days free | US $2.99 · CA $2.99 · EU €1.99 · IN ₹100 · BR R$8.99 · MX $29 |
| `cookcan_pro_yearly` | Yearly | 7 days free | US $29.99 · CA $29.99 · EU €19.99 · IN ₹999 · BR R$89.99 · MX $290 |

LATAM monthly target: **~USD 1.50** local equivalent.

## 3. License testers
Play Console → Settings → License testing → add your Gmail.

## 4. Store listing
- Feature graphic: `assets/feature-graphic.png` (1024×500)
- Icon: `assets/icon.png`
- Privacy policy URL (must be live)
- Short description: *Scan ingredients. Cook with Gemini. Enjoy.*

## 5. Data safety
Declare: camera, photos, account email (if Supabase), purchases (Play Billing), AI processing (Gemini).

## 6. Build & upload (your machine)
```bash
eas login
eas init                    # links project, updates app.json projectId
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "YOUR_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_KEY"  # optional

eas build --profile production --platform android
eas submit --profile production --platform android
```

First release: **Internal testing** track (already set in `eas.json`).

## 7. QA before production
- [ ] Install internal build from Play
- [ ] 5 free scans → paywall shows **local currency**
- [ ] Subscribe (license tester) monthly + yearly
- [ ] Restore purchases
- [ ] Scan → recipes (with Gemini key)
- [ ] AI Chef locked on Free, open on Pro
