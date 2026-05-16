# Division United

A game-like voting app that visualizes political division. Visitors pick Left, Middle, or Right — results display as a live tug-of-war bar. Votes are anonymous and deduplicated by IP address.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) — atomic vote counters + IP deduplication
- [Tailwind CSS](https://tailwindcss.com)

## Environment variables

Copy the example file and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID (e.g. `division-united`) |
| `FIREBASE_CLIENT_EMAIL` | Service account email from the downloaded JSON key |
| `FIREBASE_PRIVATE_KEY` | Private key from the downloaded JSON key — keep the surrounding quotes and the literal `\n` characters |

### Getting Firebase credentials

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and open your project
2. Click the gear icon → **Project settings** → **Service accounts**
3. Click **Generate new private key** — a JSON file will download
4. Copy `project_id`, `client_email`, and `private_key` from that JSON into `.env.local`

> **Note:** The private key spans multiple lines in the JSON but is stored as a single string with `\n` escape sequences. Paste it as-is, wrapped in double quotes.

### Setting up Firestore

In your Firebase project, go to **Build → Firestore Database → Create database**. Choose **Production mode** and pick a region. The `votes/counts` document is created automatically on the first vote.

## Running locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

Set the same three environment variables in your hosting platform (Vercel, Railway, etc.) and deploy. On Vercel:

**Settings → Environment Variables** → add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
