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
│   ├── db.ts                       # IndexedDB CRUD
│   ├── rss.ts                      # parseFeed (RSS2+Atom) + fetchFeed (browser-like AU + decoding)
│   ├── opml.ts                     # parseOPML + generateOPML
│   └── favicon.ts                  # getFaviconUrl
├── features/
│   ├── settings/useSettings.ts     # textSize (14–36px), theme toggle, persisted
│   ├── feeds/
│   │   ├── useFeeds.ts             # add/update/remove/import feeds, auto-sorted by name
│   │   ├── AddFeedModal.tsx        # Add/edit feed modal
│   │   └── ImportOPMLModal.tsx     # OPML Import modal (URL or File)
│   └── articles/
│       ├── useArticles.ts          # Fetch + parse feeds, sort by date
│       ├── ArticleItem.tsx         # Single article row + expand/collapse
│       └── ArticleList.tsx         # List with states
└── components/
    ├── Navbar.tsx                  # Sticky navbar: full-width feed dropdown, refresh, A+/A-, theme
    ├── Sidebar.tsx                 # Left overlay: sorted feed list, Add/Import/Export OPML buttons
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

## Color palette (8 colors)

`#DC2626` `#F97316` `#FFB800` `#16A34A` `#2563EB` `#7C3AED` `#DB2777` `#475569`
