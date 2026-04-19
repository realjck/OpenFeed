import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { type Feed } from '../../types';
import { getFeeds, saveFeed, deleteFeed } from '../../lib/db';

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    getFeeds().then(setFeeds);
  }, []);

  const addFeed = useCallback(async (data: Omit<Feed, 'id'>) => {
    const feed: Feed = { id: uuidv4(), ...data };
    await saveFeed(feed);
    setFeeds((prev) => [...prev, feed]);
  }, []);

  const updateFeed = useCallback(async (feed: Feed) => {
    await saveFeed(feed);
    setFeeds((prev) => prev.map((f) => (f.id === feed.id ? feed : f)));
  }, []);

  const removeFeed = useCallback(async (id: string) => {
    await deleteFeed(id);
    setFeeds((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const importFeeds = useCallback(async (dataArray: Omit<Feed, 'id'>[]) => {
    const newFeeds: Feed[] = dataArray.map((data) => ({ id: uuidv4(), ...data }));
    // Batch save to DB
    for (const feed of newFeeds) {
      await saveFeed(feed);
    }
    setFeeds((prev) => [...prev, ...newFeeds]);
  }, []);

  return { feeds, addFeed, updateFeed, removeFeed, importFeeds };
}
