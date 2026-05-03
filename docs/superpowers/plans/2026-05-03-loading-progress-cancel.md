# Loading Progress & Cancel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live "X of Y feeds loaded" progress counter and a Cancel button to the RSS loading screen, allowing users to interrupt loading and see partial results immediately.

**Architecture:** `fetchFeed` gains an optional `AbortSignal` param passed to `fetch()`; `useArticles` wraps individual fetch promises to track progress and exposes `progress` + `cancel`; `Loader` gains optional `progress`/`onCancel` props rendered below the animation; `ArticleList` and `App` wire the new props through.

**Tech Stack:** React 19, TypeScript, Vitest, @testing-library/react

---

### Task 1: Create feature branch

**Files:** none (git only)

- [ ] Create and switch to the feature branch:
```bash
git checkout -b feat/loading-progress-cancel
```

- [ ] Verify:
```bash
git branch
# should show * feat/loading-progress-cancel
```

---

### Task 2: Add AbortSignal to fetchFeed (TDD)

**Files:**
- Modify: `src/lib/rss.ts`
- Modify: `src/lib/rss.test.ts`

- [ ] Add this test inside the `fetchFeed` describe block in `src/lib/rss.test.ts`:
```ts
it('passes abort signal to fetch when provided', async () => {
  (fetch as any).mockResolvedValue({ ok: true, text: async () => RSS_XML });
  const controller = new AbortController();
  await fetchFeed('https://myblog.com/feed.xml', 'f1', 'My Blog', controller.signal);
  expect(fetch).toHaveBeenCalledWith(
    'https://proxy.example.com?url=https%3A%2F%2Fmyblog.com%2Ffeed.xml',
    { signal: controller.signal }
  );
});
```

- [ ] Run the test file to confirm the new test fails:
```bash
npm run test:run -- src/lib/rss.test.ts
```
Expected: FAIL — `fetchFeed` does not accept or forward `signal` yet.

- [ ] Update `fetchFeed` in `src/lib/rss.ts` — add `signal` param and forward it:
```ts
export async function fetchFeed(
  url: string,
  feedId: string,
  feedName: string,
  signal?: AbortSignal
): Promise<ParsedFeed> {
  const workerUrl = import.meta.env.VITE_WORKER_URL;
  const response = await fetch(
    `${workerUrl}?url=${encodeURIComponent(url)}`,
    signal ? { signal } : undefined
  );
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const xml = await response.text();
  return parseFeed(xml, feedId, feedName);
}
```

- [ ] Run all rss tests to confirm they all pass:
```bash
npm run test:run -- src/lib/rss.test.ts
```
Expected: all PASS (existing tests still pass because `signal` is optional).

- [ ] Commit:
```bash
git add src/lib/rss.ts src/lib/rss.test.ts
git commit -m "feat(rss): add optional AbortSignal to fetchFeed"
```

---

### Task 3: Add progress tracking and cancel to useArticles (TDD)

**Files:**
- Modify: `src/features/articles/useArticles.ts`
- Modify: `src/features/articles/useArticles.test.ts`

- [ ] In `src/features/articles/useArticles.test.ts`, make these changes:

1. Update the existing `'fetches articles for all feeds on mount'` assertion to match the new 4-arg signature:
```ts
expect(fetchFeed).toHaveBeenCalledWith(
  'https://example.com/feed', 'f1', 'Test', expect.any(AbortSignal)
);
```

2. Add these three new tests after the existing ones:
```ts
it('exposes progress while loading', async () => {
  const { fetchFeed } = await import('../../lib/rss');
  let resolve1: (val: any) => void;
  let resolve2: (val: any) => void;
  (fetchFeed as any)
    .mockImplementationOnce(() => new Promise(r => { resolve1 = r; }))
    .mockImplementationOnce(() => new Promise(r => { resolve2 = r; }));

  const feed2: Feed = { id: 'f2', name: 'Feed2', url: 'https://example.com/feed2' };
  const { result } = renderHook(() => useArticles([mockFeed, feed2], null));

  expect(result.current.progress).toEqual({ loaded: 0, total: 2 });

  await act(async () => {
    resolve1!({ channelTitle: '', articles: [mockArticle] });
    await new Promise(r => setTimeout(r, 0));
  });
  expect(result.current.progress).toEqual({ loaded: 1, total: 2 });

  await act(async () => {
    resolve2!({ channelTitle: '', articles: [] });
    await new Promise(r => setTimeout(r, 0));
  });
  expect(result.current.progress).toBeNull();
});

it('cancel applies partial articles and marks pending feeds as cancelled', async () => {
  const { fetchFeed } = await import('../../lib/rss');
  let resolve1: (val: any) => void;
  (fetchFeed as any)
    .mockImplementationOnce(() => new Promise(r => { resolve1 = r; }))
    .mockImplementationOnce((_u: any, _i: any, _n: any, signal: AbortSignal) =>
      new Promise((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError'))
        );
      })
    );

  const feed2: Feed = { id: 'f2', name: 'Feed2', url: 'https://example.com/feed2' };
  const { result } = renderHook(() => useArticles([mockFeed, feed2], null));

  await act(async () => {
    resolve1!({ channelTitle: '', articles: [mockArticle] });
    await new Promise(r => setTimeout(r, 0));
  });

  await act(async () => {
    result.current.cancel();
    await new Promise(r => setTimeout(r, 0));
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.articles).toHaveLength(1);
  expect(result.current.error).toContain('Feed2: cancelled');
});

it('refresh after cancel creates a fresh load', async () => {
  const { fetchFeed } = await import('../../lib/rss');
  (fetchFeed as any).mockResolvedValue({ channelTitle: '', articles: [mockArticle] });

  const { result } = renderHook(() => useArticles([mockFeed], null));

  await act(async () => { result.current.cancel(); });
  await act(async () => { result.current.refresh(); });
  await act(async () => {});

  expect(result.current.articles).toHaveLength(1);
  expect(result.current.loading).toBe(false);
});
```

- [ ] Run the test file to confirm new tests fail (and updated assertion fails):
```bash
npm run test:run -- src/features/articles/useArticles.test.ts
```
Expected: 3 new tests FAIL, updated `toHaveBeenCalledWith` also FAIL.

- [ ] Replace the entire content of `src/features/articles/useArticles.ts`:
```ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { type Feed, type Article } from '../../types';
import { fetchFeed } from '../../lib/rss';

export function useArticles(feeds: Feed[], activeFeedId: string | null) {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);

  const feedsRef = useRef(feeds);
  feedsRef.current = feeds;

  const cancelRef = useRef<() => void>(() => {});
  const cancel = useCallback(() => { cancelRef.current(); }, []);

  const load = useCallback(async () => {
    const currentFeeds = feedsRef.current;
    if (currentFeeds.length === 0) {
      setAllArticles([]);
      return;
    }

    const controller = new AbortController();
    const total = currentFeeds.length;
    const partialArticles: Article[] = [];
    const partialErrors: string[] = [];
    const settled = new Set<number>();

    setLoading(true);
    setError(null);
    setProgress({ loaded: 0, total });

    const applyResults = (cancelled: boolean) => {
      cancelRef.current = () => {};
      const pendingFeeds = currentFeeds.filter((_, i) => !settled.has(i));
      const allErrors = [
        ...partialErrors,
        ...(cancelled ? pendingFeeds.map((f) => `${f.name}: cancelled`) : []),
      ];
      partialArticles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
      setAllArticles([...partialArticles]);
      setError(allErrors.length > 0 ? allErrors.join('; ') : null);
      setLoading(false);
      setProgress(null);
    };

    cancelRef.current = () => {
      controller.abort();
      applyResults(true);
    };

    const promises = currentFeeds.map((f, i) =>
      fetchFeed(f.url, f.id, f.name, controller.signal)
        .then((result) => {
          partialArticles.push(...result.articles);
        })
        .catch((err: any) => {
          if (err.name !== 'AbortError') {
            partialErrors.push(`${f.name}: ${err?.message ?? 'Unknown error'}`);
          }
        })
        .finally(() => {
          settled.add(i);
          if (!controller.signal.aborted) {
            setProgress({ loaded: settled.size, total });
          }
        })
    );

    await Promise.allSettled(promises);

    if (!controller.signal.aborted) {
      applyResults(false);
    }
  }, []);

  const initialLoadDoneRef = useRef(false);
  const feedsKey = feeds.map((f) => f.id).join(',');
  useEffect(() => {
    if (!initialLoadDoneRef.current && feedsKey) {
      initialLoadDoneRef.current = true;
      load();
    }
  }, [load, feedsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    load();
  }, [load]);

  const articles = activeFeedId
    ? allArticles.filter((a) => a.feedId === activeFeedId)
    : allArticles;

  return { articles, loading, error, progress, cancel, refresh };
}
```

- [ ] Run all useArticles tests:
```bash
npm run test:run -- src/features/articles/useArticles.test.ts
```
Expected: all PASS.

- [ ] Commit:
```bash
git add src/features/articles/useArticles.ts src/features/articles/useArticles.test.ts
git commit -m "feat(articles): add progress tracking and cancel to useArticles"
```

---

### Task 4: Update Loader UI

**Files:**
- Modify: `src/components/Loader.tsx`
- Modify: `src/components/Loader.css`

- [ ] Replace `src/components/Loader.tsx`:
```tsx
import './Loader.css';

interface LoaderProps {
  progress?: { loaded: number; total: number };
  onCancel?: () => void;
}

export function Loader({ progress, onCancel }: LoaderProps = {}) {
  return (
    <div className="loader-container">
      <div className="geometric-loader">
        <div className="geo-box box-1"></div>
        <div className="geo-box box-2"></div>
        <div className="geo-box box-3"></div>
      </div>
      <p className="loader-text">Loading Articles</p>
      {progress && (
        <p className="loader-progress">{progress.loaded} of {progress.total} feeds loaded</p>
      )}
      {onCancel && (
        <button className="loader-cancel" onClick={onCancel}>Cancel</button>
      )}
    </div>
  );
}
```

- [ ] Append to `src/components/Loader.css`:
```css
.loader-progress {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text);
  letter-spacing: 0.2em;
  opacity: 0.7;
}

.loader-cancel {
  margin-top: 16px;
  padding: 8px 20px;
  background: transparent;
  color: var(--text);
  border: 2px solid var(--text);
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.loader-cancel:hover {
  background: var(--text);
  color: var(--bg);
}
```

- [ ] Commit:
```bash
git add src/components/Loader.tsx src/components/Loader.css
git commit -m "feat(loader): add progress text and cancel button"
```

---

### Task 5: Wire ArticleList

**Files:**
- Modify: `src/features/articles/ArticleList.tsx`

- [ ] Update the `Props` interface (replace the existing one):
```ts
interface Props {
  articles: Article[];
  feeds: Feed[];
  loading: boolean;
  error: string | null;
  progress?: { loaded: number; total: number };
  onCancel?: () => void;
}
```

- [ ] Update the function signature (replace the existing one):
```ts
export function ArticleList({ articles, feeds, loading, error, progress, onCancel }: Props) {
```

- [ ] Replace the loading branch:
```tsx
if (loading) {
  return <Loader progress={progress} onCancel={onCancel} />;
}
```

- [ ] Commit:
```bash
git add src/features/articles/ArticleList.tsx
git commit -m "feat(articles): wire progress and cancel through ArticleList"
```

---

### Task 6: Wire App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] Update the `useArticles` destructure (replace existing line):
```ts
const { articles, loading, error, refresh, progress, cancel } = useArticles(feeds, activeFeedId);
```

- [ ] Update the `<ArticleList>` JSX (replace existing):
```tsx
<ArticleList
  articles={articles}
  feeds={feeds}
  loading={loading}
  error={error}
  progress={progress}
  onCancel={cancel}
/>
```

- [ ] Commit:
```bash
git add src/App.tsx
git commit -m "feat(app): pass progress and cancel to ArticleList"
```

---

### Task 7: Full test run and dev verification

- [ ] Run the full test suite:
```bash
npm run test:run
```
Expected: all tests PASS, no regressions.

- [ ] Start dev server:
```bash
npm run dev
```

- [ ] Open `http://localhost:5173/OpenFeed/` in a browser with feeds configured and verify:
  - Loading spinner shows "0 of N feeds loaded" below the animation
  - Counter increments as each feed loads
  - "Cancel" button is visible during loading
  - Clicking "Cancel" immediately stops loading and shows already-fetched articles
  - Cancelled feeds appear in the error banner as `"FeedName: cancelled"`
  - Clicking Refresh after cancel starts a fresh load with no residual state

- [ ] Run full tests one final time:
```bash
npm run test:run
```
Expected: all PASS.
