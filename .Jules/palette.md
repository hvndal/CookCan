## 2026-07-07 - Authentication UX & Accessibility Learnings
**Learning:** React Native buttons often lack default accessible states and visual loading indicators. In CookCan, async authentication calls leave the UI looking frozen without explicit `busy` and `disabled` states passed to accessibility APIs and a visual `ActivityIndicator`.
**Action:** Always add explicit `ActivityIndicator` for loading states and pair it with `accessibilityState={{ disabled: true, busy: true }}` for async actions, and ensure all TextInput fields have an `accessibilityLabel`.

## 2026-07-07 - Semantic TextInput Enhancements
**Learning:** React Native `TextInput` components often lack native OS integrations out of the box. Adding semantic attributes like `keyboardType`, `textContentType`, and `autoComplete` enables critical native features like specific keyboard layouts (e.g., email with '@') and system-level autofill/password managers, providing an immediate, high-impact micro-UX improvement.
**Action:** Always verify and include appropriate semantic attributes (`keyboardType`, `textContentType`, `autoComplete`) on `TextInput` fields, especially for standard forms like login and registration.
