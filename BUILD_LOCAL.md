# Build AAB locally (Play upload)

## 1. Secrets (never commit)
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh ~/Downloads/gemini.env
# or: cp ~/Downloads/gemini.env ./gemini.env && ./scripts/setup-env.sh ./gemini.env
```

## 2. EAS production AAB (recommended)
```bash
npm install
eas login
eas init
eas build --profile production --platform android
```
Download the `.aab` from the Expo build page when done.

## 3. Optional: build on your machine without EAS cloud
```bash
eas build --profile production --platform android --local
```
Requires Android SDK + Java installed.

**Never** `git add .env` or `gemini.env` — both are gitignored.
