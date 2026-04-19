# OpenFeed — CLAUDE.md

## Project overview

Client-side PWA RSS reader. Single-page app, mobile-first. No server — everything runs in the browser. Deployed on GitHub Pages.

## Tech stack

- **Vite 8 + React 19 + TypeScript**
- **idb** — IndexedDB wrapper for persistent storage
- **fast-xml-parser** — RSS/Atom XML parsing
- **vite-plugin-pwa** — PWA manifest + service worker
- **Vitest 4 + @testing-library/react** — unit/hook tests
- **fake-indexeddb** — IndexedDB mock for tests

## Commands

```bash
npm run dev          # dev server at http://localhost:5173/OpenFeed/
npm run build        # production build → dist/
npm run preview      # preview production build at http://localhost:4173/OpenFeed/
npm run test:run     # run all tests once
npm run test         # watch mode
npm run coverage     # coverage report
```

## Project structure

```
src/
├── types.ts                        # Feed, Settings, Article interfaces + FEED_COLORS + DEFAULT_SETTINGS
├── App.tsx                         # Root — owns all state, wires components
├── index.css                       # CSS custom properties (theme), global reset
├── lib/
│   ├── db.ts                       # IndexedDB CRUD (getFeeds, saveFeed, deleteFeed, getSettings, saveSettings)
│   ├── rss.ts                      # parseFeed (RSS2+Atom) + fetchFeed via Cloudflare Worker
│   └── favicon.ts                  # getFaviconUrl (Google favicon service)
├── features/
│   ├── settings/useSettings.ts     # textSize (12–24px), theme toggle, persisted
│   ├── feeds/
│   │   ├── useFeeds.ts             # addFeed/updateFeed/removeFeed, uuid ids, persisted
│   │   └── AddFeedModal.tsx        # Add/edit feed modal with URL auto-name detection
│   └── articles/
│       ├── useArticles.ts          # Fetch + parse all/filtered feeds, sort by date
│       ├── ArticleItem.tsx         # Single article row + expand/collapse
│       └── ArticleList.tsx         # List with empty states and error banner
└── components/
    ├── Navbar.tsx                  # Sticky navbar: sidebar toggle, feed dropdown, refresh, A+/A-, theme
    └── Sidebar.tsx                 # Left overlay: feed list with edit/delete, add button

worker/
├── src/index.ts                    # Cloudflare Worker — CORS proxy for RSS fetching
└── wrangler.toml
```

## Architecture

**State management:** all state lives in `App.tsx` and is passed down as props. No context. No Redux.

**CSS theming:** CSS custom properties on `:root` (dark by default), overridden by `[data-theme="light"]`. The `--article-fs` variable is set inline on the root div via `style` prop and drives article title font size.

**RSS fetching flow:** `useArticles` → `fetchFeed` (rss.ts) → `VITE_WORKER_URL?url=<encoded>` (Cloudflare Worker) → returns XML → `parseFeed` → Article[]

**Infinite render fix:** `useArticles` uses refs (`feedsRef`, `activeFeedIdRef`) to avoid stale closures, with a `feedsKey` string in `useEffect` deps to trigger re-fetch only when feed IDs change.

## Environment variables

```bash
# .env.local (local dev)
VITE_WORKER_URL=http://localhost:8787

# GitHub Secret (production)
VITE_WORKER_URL=https://openfeed-proxy.YOUR_NAME.workers.dev
```

## Cloudflare Worker

Located in `worker/`. Deploy separately:

```bash
cd worker
npx wrangler login
npm run deploy        # → https://openfeed-proxy.YOUR_NAME.workers.dev
npm run dev           # local at http://localhost:8787
```

## Testing

Tests use `fake-indexeddb` for IndexedDB isolation. The `db.ts` module caches the IDB connection as a module-level singleton — resetting `global.indexedDB` in `beforeEach` doesn't clear the cache. Tests are written with upsert-safe data so ordering doesn't matter.

Hook tests use `@testing-library/react`'s `renderHook` + `act`. `useFeeds` tests use `vi.resetModules()` for proper isolation.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on push to `main` and deploys `dist/` to the `gh-pages` branch. Requires `VITE_WORKER_URL` secret set in repo settings.

App URL: `https://YOUR_USERNAME.github.io/OpenFeed/`

## Color palette (8 colors)

`#DC2626` `#EA580C` `#CA8A04` `#16A34A` `#2563EB` `#7C3AED` `#DB2777` `#475569`
