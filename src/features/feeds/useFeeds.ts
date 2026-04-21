import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { type Feed } from '../../types';
import { getFeeds, saveFeed, deleteFeed } from '../../lib/db';
import { getFeedIconUrl } from '../../lib/favicon';

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    getFeeds().then(setFeeds);
  }, []);

  const addFeed = useCallback(async (data: Omit<Feed, 'id'>) => {
    const feed: Feed = { id: uuidv4(), iconUrl: getFeedIconUrl(data.url), ...data };
    await saveFeed(feed);
    setFeeds((prev) => [...prev, feed]);
  }, []);

  const updateFeed = useCallback(async (feed: Feed) => {
    const updated = { ...feed, iconUrl: feed.iconUrl || getFeedIconUrl(feed.url) };
    await saveFeed(updated);
    setFeeds((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }, []);

  const removeFeed = useCallback(async (id: string) => {
    await deleteFeed(id);
    setFeeds((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const importFeeds = useCallback(async (dataArray: Omit<Feed, 'id'>[]) => {
    const newFeeds: Feed[] = dataArray.map((data) => ({ id: uuidv4(), iconUrl: getFeedIconUrl(data.url), ...data }));
    // Batch save to DB
    for (const feed of newFeeds) {
      await saveFeed(feed);
    }
    setFeeds((prev) => [...prev, ...newFeeds]);
  }, []);

  const sortedFeeds = [...feeds].sort((a, b) => a.name.localeCompare(b.name));

  return { feeds: sortedFeeds, addFeed, updateFeed, removeFeed, importFeeds };
}
