# OpenFeed — Design Spec
_Date: 2026-04-19_

## Overview

Client-side PWA RSS reader built with Vite + React + TypeScript. Deployed on GitHub Pages. All data persisted in IndexedDB. UI fully in English.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Vite + React + TypeScript |
| Storage | IndexedDB via `idb` |
| RSS fetch | Cloudflare Worker (CORS proxy) |
| RSS parsing | `fast-xml-parser` (client-side) |
| Favicons | Google Favicon API (`https://www.google.com/s2/favicons?domain=X&sz=32`) |
| PWA | Minimal — manifest + basic service worker (installable only) |
| Hosting | GitHub Pages (`base: '/OpenFeed/'` in vite.config.ts) |

---

## Architecture

```
src/
├── features/
│   ├── feeds/        # useFeeds hook, FeedList, AddFeedModal
│   ├── articles/     # useArticles hook, ArticleList, ArticleItem
│   └── settings/     # useSettings hook (textSize, theme)
├── components/       # Navbar, Sidebar (shared)
├── lib/
│   ├── db.ts         # IndexedDB setup via idb
│   ├── rss.ts        # fetch via Cloudflare Worker + parse XML
│   └── favicon.ts    # favicon URL helper
└── App.tsx

worker/               # Cloudflare Worker source (CORS proxy)
public/               # manifest.json, PWA icons
```

---

## Cloudflare Worker (CORS Proxy)

Accepts `GET ?url=<encoded_feed_url>`, fetches the XML server-side, returns it with permissive CORS headers. Deployed on `workers.dev` free tier (100k req/day). The app's `rss.ts` calls this worker for all feed fetches.

---

## Data Layer

### IndexedDB stores

```ts
interface Feed {
  id: string      // uuid
  name: string
  url: string
  color: string   // hex from the 8-color palette
}

interface Settings {
  textSize: number  // px, range 12–24, default 16
  theme: 'light' | 'dark'
}
```

### Runtime-only (not persisted)

```ts
interface Article {
  feedId: string
  feedColor: string
  title: string
  description: string
  link: string
  pubDate: Date
  imageUrl?: string
  sourceDomain: string  // used to build favicon URL
}
```

Articles are not cached — reloaded on each refresh (consistent with minimal PWA approach).

### Hooks

- `useFeeds()` — CRUD on feeds, persisted to IndexedDB
- `useArticles(feeds, activeFeedId)` — fetches and parses feeds, returns articles sorted by date. Triggered on mount and on manual refresh.
- `useSettings()` — reads/writes textSize and theme to IndexedDB

---

## Color Palette (8 colors)

| Name | Hex |
|---|---|
| Red | `#DC2626` |
| Orange | `#EA580C` |
| Amber | `#CA8A04` |
| Green | `#16A34A` |
| Blue | `#2563EB` |
| Violet | `#7C3AED` |
| Pink | `#DB2777` |
| Slate | `#475569` |

---

## UI Components

### Navbar (sticky, left to right)
- **Burger button** — opens/closes Sidebar
- **Feed dropdown** — shows "ALL" by default; clicking opens a dropdown list with ALL first, then each feed with its color dot and truncated name. Selecting a feed filters the article list and colors the button.
- **Refresh button** — re-triggers `useArticles` fetch
- **A+ / A- buttons** — increment/decrement textSize by 1px (clamped to 12–24)
- **Light/Dark toggle** — switches theme

### Sidebar (left overlay)
- Slides in from the left, overlays the main content
- Closes on outside click or burger toggle
- Lists all feeds: color dot • name • truncated URL + edit/delete icons
- Large "+" button at the bottom → opens AddFeedModal
- Edit icon on a feed → opens AddFeedModal pre-filled with that feed's data (no auto-fetch on edit)

### AddFeedModal
- URL input field
- On URL blur/submit: fetch the feed via worker, parse `<channel><title>` to pre-fill the name field
- Name input (editable, pre-filled from feed title)
- Color picker: 8 colored circles, click to select
- Cancel / Save buttons

### ArticleList
- Filtered by `activeFeedId` (or all feeds if "ALL")
- Empty states:
  - No feeds configured → "Add RSS feeds using the sidebar to get started."
  - Feeds configured but no articles → "No articles found."
- Each row: colored left border (feed color) | favicon (16px) | full title (wraps)
- `textSize` applied to article titles

### ArticleItem (expanded)
- Click on article row → inline accordion expand (no page navigation)
- Shows: image (if present), description text, "Read article →" button (opens in new tab)
- Click again (or on another article) → collapses

---

## PWA

- `manifest.json` with name, icons, `display: standalone`
- Basic service worker registered via Vite PWA plugin (`vite-plugin-pwa`) — caches app shell only, no article caching
- Installable on mobile and desktop

---

## Deployment

- GitHub Actions workflow: `npm run build` → deploy `dist/` to `gh-pages` branch
- Cloudflare Worker deployed separately via `wrangler`
