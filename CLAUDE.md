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
├── types.ts                        # Feed, Settings, Article interfaces + DEFAULT_SETTINGS
├── App.tsx                         # Root — owns all state, wires components
├── index.css                       # CSS custom properties (theme), global reset
├── lib/
│   ├── db.ts                       # IndexedDB CRUD
│   ├── rss.ts                      # parseFeed (RSS2+Atom, returns siteUrl) + fetchFeed
│   ├── opml.ts                     # parseOPML + generateOPML
│   └── favicon.ts                  # getFaviconUrl, getFeedIconUrl (uses siteUrl when available)
├── features/
│   ├── settings/useSettings.ts     # textSize (14–36px), theme toggle, persisted
│   ├── feeds/
│   │   ├── useFeeds.ts             # add/update/remove/import feeds, computes iconUrl on save
│   │   ├── AddFeedModal.tsx        # Add/edit feed modal (captures siteUrl from RSS for better icon)
│   │   └── ImportOPMLModal.tsx     # OPML Import modal (URL or File)
│   └── articles/
│       ├── useArticles.ts          # Fetch + parse feeds, progress tracking, cancel, sort by date
│       ├── ArticleItem.tsx         # Single article row + expand/collapse
│       └── ArticleList.tsx         # List with states
└── components/
    ├── Navbar.tsx                  # Sticky navbar: full-width feed dropdown, refresh, A+/A-, theme
    ├── Sidebar.tsx                 # Left overlay: sorted feed list, Add/Import/Export OPML buttons
    ├── FeedIcon.tsx                # Feed favicon img with letter fallback, sized in em
    ├── Loader.tsx                  # Loading animation + optional progress text + Cancel button
    └── ConfirmModal.tsx            # Generic deletion confirmation modal
```

## Architecture

**State management:** all state lives in `App.tsx` and is passed down as props.

**CSS Design System:** 
- **Theming:** Custom properties on `:root`, overridden by `[data-theme="light"]`.
- **Brutalist Style:** Thick solid borders (`2px solid var(--text)`) and bold outlines for buttons.
- **Dynamic Sizing:** `--article-fs` drives article titles, descriptions (`calc(-4px)`), and navbar dropdown items.

**RSS/OPML flow:** 
- **Worker:** Cloudflare Worker acts as a CORS proxy. It uses a realistic browser `User-Agent` and `Referer` headers to avoid being blocked by providers (e.g., Reddit).
- **Decoding:** RSS titles and descriptions are processed through a `decodeEntities` utility to handle HTML entities (e.g., `&#8217;`).
- **OPML:** Supports both import (multiple feeds) and export (timestamped `.opml.xml` files).

**Feed icons:**
- `iconUrl` is stored on each `Feed` in IndexedDB, computed via `getFeedIconUrl` (Google Favicon Service at `sz=32`).
- When available, the RSS channel `<link>` (site URL) is used as the favicon domain (better quality than feed URL hostname).
- Icons are computed at add/import/update time in `useFeeds`. Existing feeds without `iconUrl` get a fallback computed on-the-fly in `FeedIcon` and are updated next time the feed is edited.
- `FeedIcon` renders an `<img>` with a letter fallback (first char of feed name) when the icon fails or is missing.

**Article loading strategy (`useArticles`):**
- All feeds are always fetched at once (on mount or manual refresh). Selecting a feed filters in memory — no refetch.
- Add/remove/import feeds set a `pendingRefreshRef` flag in `App.tsx`; the actual refetch fires when the sidebar closes (`handleCloseSidebar`), not immediately.
- Each `load()` creates an `AbortController`; feeds are fetched in parallel with individual promise wrappers that increment a `loaded` counter. Exposes `progress: { loaded, total } | null` and `cancel()`.
- `cancel()` aborts in-flight fetches immediately, applies partial results, and marks unsettled feeds as `"FeedName: cancelled"` in the error string. `fetchFeed` accepts an optional `signal?: AbortSignal` forwarded to `fetch()`.

## Environment variables

```bash
# .env.local (local dev)
VITE_WORKER_URL=http://localhost:8787

# GitHub Secret (production)
VITE_WORKER_URL=https://openfeed-proxy.YOUR_NAME.workers.dev
```

## Cloudflare Worker

Located in `worker/`. Uses `wrangler` for deployment.
Key modification: Spoofs browser headers (`User-Agent`, `Accept`, `Referer`) to bypass firewall blocks on RSS feeds like Reddit.

## Testing

Tests use `fake-indexeddb` for IndexedDB isolation. Hook tests use `renderHook` + `act` from `@testing-library/react`.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds on push to `main`. Requires `VITE_WORKER_URL` secret.

