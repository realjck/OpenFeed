import { useState, useEffect, useCallback, useRef } from 'react';
import { type Feed, type Article } from '../../types';
import { fetchFeed } from '../../lib/rss';

export function useArticles(feeds: Feed[], activeFeedId: string | null) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures without re-creating load on every render
  const feedsRef = useRef(feeds);
  const activeFeedIdRef = useRef(activeFeedId);
  feedsRef.current = feeds;
  activeFeedIdRef.current = activeFeedId;

  const load = useCallback(async () => {
    const currentFeeds = feedsRef.current;
    const currentActiveFeedId = activeFeedIdRef.current;

    if (currentFeeds.length === 0) {
      setArticles([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const feedsToFetch = currentActiveFeedId
        ? currentFeeds.filter((f) => f.id === currentActiveFeedId)
        : currentFeeds;
      const results = await Promise.allSettled(
        feedsToFetch.map((f) => fetchFeed(f.url, f.id, f.color, f.name))
      );
      const all: Article[] = [];
      const errors: string[] = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          all.push(...r.value.articles);
        } else {
          errors.push(`${feedsToFetch[i].name}: ${r.reason?.message ?? 'Unknown error'}`);
        }
      });
      all.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
      setArticles(all);
      if (errors.length > 0) setError(errors.join('; '));
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch feeds');
    } finally {
      setLoading(false);
    }
  }, []); // stable: no deps, uses refs

  // Re-run load when feeds list or activeFeedId meaningfully changes
  const feedsKey = feeds.map((f) => f.id).join(',');
  useEffect(() => {
    load();
  }, [load, feedsKey, activeFeedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { articles, loading, error, refresh };
}
