# OpenFeed

A client-side PWA RSS reader. Add feeds, read articles, works offline. Deployed on GitHub Pages with no backend.

## Setup

### 1. Deploy the Cloudflare Worker (required for RSS fetching)

```bash
cd worker
npx wrangler login
npm run deploy
# Note the deployed URL: https://openfeed-proxy.YOUR_NAME.workers.dev
```

### 2. Configure the app

Create `.env.local`:

```bash
VITE_WORKER_URL=https://openfeed-proxy.YOUR_NAME.workers.dev
```

### 3. Run locally

```bash
npm install
npm run dev
# http://localhost:5173/OpenFeed/
```

## Deploy to GitHub Pages

1. Set the `VITE_WORKER_URL` secret in your repo settings (Settings → Secrets → Actions)
2. Push to `main` — GitHub Actions builds and deploys automatically

App URL: `https://YOUR_USERNAME.github.io/OpenFeed/`

## Tech stack

- Vite 8 + React 19 + TypeScript
- IndexedDB (idb) for persistent storage
- fast-xml-parser for RSS/Atom parsing
- Cloudflare Worker as CORS proxy
- vite-plugin-pwa for installability
