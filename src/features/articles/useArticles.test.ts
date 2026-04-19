import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useArticles } from './useArticles';
import type { Feed, Article } from '../../types';

const mockFeed: Feed = { id: 'f1', name: 'Test', url: 'https://example.com/feed', color: '#DC2626' };

const mockArticle: Article = {
  feedId: 'f1', feedColor: '#DC2626', feedName: 'Test',
  title: 'A', description: 'B', link: 'https://example.com/a',
  pubDate: new Date('2024-01-01'), sourceDomain: 'example.com',
};

vi.mock('../../lib/rss', () => ({
  fetchFeed: vi.fn(),
}));

describe('useArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with empty articles and loading false', () => {
    const { result } = renderHook(() => useArticles([], null));
    expect(result.current.articles).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches articles for all feeds on mount', async () => {
    const { fetchFeed } = await import('../../lib/rss');
    (fetchFeed as any).mockResolvedValue({ channelTitle: 'Test', articles: [mockArticle] });
    const { result } = renderHook(() => useArticles([mockFeed], null));
    await act(async () => {});
    expect(fetchFeed).toHaveBeenCalledWith('https://example.com/feed', 'f1', '#DC2626', 'Test');
    expect(result.current.articles).toHaveLength(1);
  });

  it('filters articles by activeFeedId', async () => {
    const { fetchFeed } = await import('../../lib/rss');
    const otherArticle = { ...mockArticle, feedId: 'f2' };
    (fetchFeed as any).mockResolvedValue({ channelTitle: 'Test', articles: [mockArticle, otherArticle] });
    const { result } = renderHook(() => useArticles([mockFeed], 'f2'));
    await act(async () => {});
    expect(result.current.articles).toHaveLength(0); // f2 articles would come from f2 feed
  });

  it('sets error on fetch failure', async () => {
    const { fetchFeed } = await import('../../lib/rss');
    (fetchFeed as any).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useArticles([mockFeed], null));
    await act(async () => {});
    expect(result.current.error).toContain('Network error');
  });
});
