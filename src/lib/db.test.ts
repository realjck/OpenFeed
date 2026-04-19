import { IDBFactory } from 'fake-indexeddb';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getFeeds, saveFeed, deleteFeed, getSettings, saveSettings } from './db';
import type { Feed, Settings } from '../types';

beforeEach(() => {
  // fresh IndexedDB for each test
  (global as any).indexedDB = new IDBFactory();
  // Reset the cached db instance in the module
  vi.resetModules();
});

afterEach(() => {
  // Clean up after each test
  vi.resetModules();
});

const mockFeed: Feed = {
  id: 'feed-1',
  name: 'Test Feed',
  url: 'https://example.com/feed.xml',
  color: '#DC2626',
};

describe('feeds', () => {
  it('returns empty array when no feeds', async () => {
    expect(await getFeeds()).toEqual([]);
  });

  it('saves and retrieves a feed', async () => {
    await saveFeed(mockFeed);
    const feeds = await getFeeds();
    expect(feeds).toHaveLength(1);
    expect(feeds[0]).toEqual(mockFeed);
  });

  it('updates an existing feed on re-save', async () => {
    await saveFeed(mockFeed);
    await saveFeed({ ...mockFeed, name: 'Updated' });
    const feeds = await getFeeds();
    expect(feeds).toHaveLength(1);
    expect(feeds[0].name).toBe('Updated');
  });

  it('deletes a feed by id', async () => {
    await saveFeed(mockFeed);
    await deleteFeed('feed-1');
    expect(await getFeeds()).toEqual([]);
  });
});

describe('settings', () => {
  it('returns default settings when none saved', async () => {
    const settings = await getSettings();
    expect(settings.textSize).toBe(16);
    expect(settings.theme).toBe('dark');
  });

  it('saves and retrieves settings', async () => {
    const s: Settings = { textSize: 20, theme: 'light' };
    await saveSettings(s);
    expect(await getSettings()).toEqual(s);
  });
});
