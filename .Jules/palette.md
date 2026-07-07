## 2026-07-07 - Authentication UX & Accessibility Learnings
**Learning:** React Native buttons often lack default accessible states and visual loading indicators. In CookCan, async authentication calls leave the UI looking frozen without explicit `busy` and `disabled` states passed to accessibility APIs and a visual `ActivityIndicator`.
**Action:** Always add explicit `ActivityIndicator` for loading states and pair it with `accessibilityState={{ disabled: true, busy: true }}` for async actions, and ensure all TextInput fields have an `accessibilityLabel`.
