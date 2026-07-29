# Firebase setup for CookCan

CookCan uses **Firebase Auth** (email/password) and **Firestore** for:
- Sign-in / sign-up
- Cloud sync of pantry + saved recipes
- **Admin Pro grants** — give users complimentary Pro without Play billing

## 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Create project (e.g. `cookcan-prod`)
3. Add a **Web** app — copy the config values into `.env`

## 2. Enable services

### Authentication
- **Sign-in method** → enable **Email/Password**
- **Sign-in method** → enable **Google**
  - Copy the **Web client ID** into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
  - Add your Android SHA-1 from `eas credentials` / Play Console to the Firebase Android app

### Firestore
- Create database (production mode)
- Deploy rules from this repo:

```bash
npm i -g firebase-tools
firebase login
firebase init firestore   # select existing project, use firebase/firestore.rules
firebase deploy --only firestore:rules
```

### Admin config (required for Pro grants)
In Firestore, create:

**Collection:** `config`  
**Document ID:** `admins`  
**Fields:**
```json
{
  "emails": ["you@example.com"]
}
```

Use the same email(s) as `EXPO_PUBLIC_ADMIN_EMAILS` in `.env`.

## 3. Environment variables

Copy `.env.example` → `.env` and fill in:

| Variable | Source |
|----------|--------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase web app config |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID |
| `EXPO_PUBLIC_ADMIN_EMAILS` | Comma-separated owner emails |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Firebase Google provider Web client ID |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Google AI / Gemini API key |

For EAS production builds:

```bash
eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "..."
# repeat for each EXPO_PUBLIC_* secret
```

## 4. Grant free Pro to a user

1. Sign in to the app with your **admin email** (`EXPO_PUBLIC_ADMIN_EMAILS`)
2. Profile → **Grant Pro access**
3. Enter the user’s email → **Grant Pro**
4. User signs in with that email → Pro unlocks (unlimited scans, AI Chef, meal planner)

Revoke anytime from the same screen.

## 5. How Pro is resolved

| Source | Priority |
|--------|----------|
| Google Play subscription | Active sub → Pro |
| Firestore `proGrants/{email}` | Admin grant → Pro |
| Neither | Free (5 scans/month) |

## 6. Security notes

- Only emails listed in `config/admins` can write `proGrants` (Firestore rules)
- `EXPO_PUBLIC_ADMIN_EMAILS` only controls who **sees** the admin UI in the app
- Keep both lists in sync with your owner email(s)
- Never commit `.env` or API keys to git

## 7. Without Firebase

If Firebase env vars are missing, the app still runs with:
- Local guest sessions
- On-device pantry/recipes
- Play Billing (when configured)

Admin grants and cloud sync require Firebase.
