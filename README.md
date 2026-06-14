# LEDGER

A private, single-file personal finance tracker. Apple-style monochrome UI, Thai/English, with Google sign-in and Cloud Firestore sync.

This is a **private app** — only authorized Google accounts can sign in and access data.

---

## How security works (important)

This app is a single static `index.html` file. The Firebase config inside it is **public by design** — the `apiKey` is a project identifier, not a password. Real security comes from two layers:

1. **Email allowlist in the app** (`ALLOWED_EMAILS` in `index.html`) — controls who sees the app UI. This is convenience only.
2. **Firestore Security Rules** (`firestore.rules`) — the real boundary. Even if someone forks the repo or edits the JavaScript in their browser, they cannot read or write your data unless they are signed in with an email in the rules.

> The allowlist in `index.html` and the email list in `firestore.rules` must match.

---

## First-time setup

### 1. Create a Firebase project
- Go to <https://console.firebase.google.com> → Add project.
- In **Build → Authentication → Sign-in method**, enable **Google**.
- In **Build → Firestore Database**, create a database (production mode).

### 2. Add your web app config
- Project settings → Your apps → Web app → copy the config object.
- Paste the values into the `initializeApp({...})` block in `index.html` (replace the `YOUR_...` placeholders).

### 3. Set the authorized email
- In `index.html`, set `ALLOWED_EMAILS = ['your@gmail.com']`.
- In `firestore.rules`, set the same email in the `isAuthorized()` list.

### 4. Deploy the Firestore rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore      # select your project, accept firestore.rules
firebase deploy --only firestore:rules
```

### 5. Authorize your domain for sign-in
- Firebase console → Authentication → Settings → **Authorized domains**.
- Add your GitHub Pages domain, e.g. `yourname.github.io`.

---

## Deploy to GitHub Pages

1. Push this repo to GitHub (public is fine — security is in the Firestore rules).
2. Repo → **Settings → Pages** → Source: `main` branch, `/root`.
3. Visit `https://yourname.github.io/your-repo/`.

> Google sign-in only works over **HTTPS**. GitHub Pages provides HTTPS automatically. Opening the file locally (`file://`) runs in offline mode using `localStorage` only.

---

## Local development

Open `index.html` directly in a browser. Without HTTPS it runs in **offline mode**: no sign-in, data stored in `localStorage` only. This is handy for testing the UI.

---

## Data model

All app state is stored as one Firestore document:

```
users/{uid}/data/fintrack
```

containing serialized keys (`txs`, `accs`, `cats`, `recs`, budgets, settings, etc.). The app mirrors this to `localStorage` for instant loads and offline use, and syncs to Firestore (debounced) on every change.
