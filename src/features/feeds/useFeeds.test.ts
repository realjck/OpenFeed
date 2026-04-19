import { IDBFactory } from 'fake-indexeddb';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  (global as any).indexedDB = new IDBFactory();
  vi.resetModules();
});

describe('useFeeds', () => {
  it('starts with empty feeds', async () => {
    const { useFeeds } = await import('./useFeeds');
    const { result } = renderHook(() => useFeeds());
    await act(async () => {});
    expect(result.current.feeds).toEqual([]);
  });

  it('addFeed generates id and persists', async () => {
    const { useFeeds } = await import('./useFeeds');
    const { result } = renderHook(() => useFeeds());
    await act(async () => {});
    await act(async () => {
      await result.current.addFeed({ name: 'Test', url: 'https://example.com/feed', color: '#DC2626' });
    });
    expect(result.current.feeds).toHaveLength(1);
    expect(result.current.feeds[0].id).toBeDefined();
    expect(result.current.feeds[0].name).toBe('Test');
  });

  it('updateFeed replaces feed by id', async () => {
    const { useFeeds } = await import('./useFeeds');
    const { result } = renderHook(() => useFeeds());
    await act(async () => {});
    await act(async () => {
      await result.current.addFeed({ name: 'Old', url: 'https://example.com/feed', color: '#DC2626' });
    });
    const id = result.current.feeds[0].id;
    await act(async () => {
      await result.current.updateFeed({ id, name: 'New', url: 'https://example.com/feed', color: '#2563EB' });
    });
    expect(result.current.feeds[0].name).toBe('New');
  });

  it('removeFeed deletes by id', async () => {
    const { useFeeds } = await import('./useFeeds');
    const { result } = renderHook(() => useFeeds());
    await act(async () => {});
    await act(async () => {
      await result.current.addFeed({ name: 'Test', url: 'https://example.com/feed', color: '#DC2626' });
    });
    const id = result.current.feeds[0].id;
    await act(async () => {
      await result.current.removeFeed(id);
    });
    expect(result.current.feeds).toHaveLength(0);
  });
});
