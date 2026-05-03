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
          if (!controller.signal.aborted && settled.size < total) {
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
