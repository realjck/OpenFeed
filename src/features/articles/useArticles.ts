import { useState, useEffect, useCallback, useRef } from 'react';
import { type Feed, type Article } from '../../types';
import { fetchFeed } from '../../lib/rss';

export function useArticles(feeds: Feed[], activeFeedId: string | null) {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedsRef = useRef(feeds);
  feedsRef.current = feeds;

  const load = useCallback(async () => {
    const currentFeeds = feedsRef.current;
    if (currentFeeds.length === 0) {
      setAllArticles([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        currentFeeds.map((f) => fetchFeed(f.url, f.id, f.name))
      );
      const all: Article[] = [];
      const errors: string[] = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          all.push(...r.value.articles);
        } else {
          errors.push(`${currentFeeds[i].name}: ${r.reason?.message ?? 'Unknown error'}`);
        }
      });
      all.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
      setAllArticles(all);
      if (errors.length > 0) setError(errors.join('; '));
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch feeds');
    } finally {
      setLoading(false);
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

  return { articles, loading, error, refresh };
}
