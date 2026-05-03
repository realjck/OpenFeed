# Loading Progress & Cancel — Design Spec

**Date:** 2026-05-03  
**Status:** Approved

## Problem

When many RSS feeds are configured, the loading phase can take a long time with no feedback on how many feeds have been fetched. Users have no way to interrupt loading and see partially-loaded results.

## Solution

Add a live progress counter ("X of Y feeds loaded") below the existing loader animation, and a "Cancel" button that stops in-flight fetches and immediately shows whatever articles have already loaded.

## Architecture

### `lib/rss.ts`

`fetchFeed` accepts an optional `signal?: AbortSignal` parameter, passed directly to the native `fetch()` call. `AbortError` propagates naturally — no special handling needed.

### `useArticles.ts`

Replace `Promise.allSettled` with individually-wrapped promises that each increment a `loaded` counter on settlement. An `AbortController` is created at the start of every `load()` call.

New state:
- `progress: { loaded: number; total: number } | null` — `null` when not loading
- `cancel: () => void` — calls `controller.abort()` and immediately applies partial results

**Cancel behaviour:**
1. `controller.abort()` fires — in-flight `fetch()` calls throw `AbortError`
2. Already-resolved promises have already pushed their articles into a mutable accumulator
3. Feeds whose promises have not yet settled are added to errors as `"FeedName: cancelled"`
4. `setAllArticles(partial)`, `setError(errors.join('; '))`, `setLoading(false)` — app transitions to normal display with partial data

A subsequent refresh creates a fresh `AbortController` with no residual state.

### `App.tsx`

Receives `progress` and `cancel` from `useArticles`, passes them down to `ArticleList`.

### `ArticleList.tsx`

Passes `progress` and `onCancel` through to `<Loader />`.

### `Loader.tsx`

New optional props:
```ts
interface LoaderProps {
  progress?: { loaded: number; total: number };
  onCancel?: () => void;
}
```

Renders below the existing animation:
- `"X of Y feeds loaded"` text when `progress` is provided
- A `Cancel` button (brutalist style: `2px solid var(--text)`, transparent background, bold) when `onCancel` is provided

## UI Layout

```
  [geometric animation]
  Loading Articles

  3 of 7 feeds loaded

  [ Cancel ]
```

## Error format

Cancelled feeds appear in the existing error area as:
```
FeedName: cancelled
```
Mixed with any real fetch errors, joined by `; `.

## Out of scope

- Sequential fetching (would hurt performance)
- Pause/resume
- Per-feed retry from the cancel state
