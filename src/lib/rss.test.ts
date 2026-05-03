import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseFeed, fetchFeed } from './rss';

const RSS_XML = `<?xml version="1.0"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>My Blog</title>
    <item>
      <title>Article One</title>
      <description>&lt;p&gt;Hello world&lt;/p&gt;</description>
      <link>https://myblog.com/article-one</link>
      <pubDate>Mon, 01 Jan 2024 12:00:00 +0000</pubDate>
      <enclosure url="https://myblog.com/img.jpg" type="image/jpeg" length="0"/>
    </item>
    <item>
      <title>Article Two</title>
      <description>Plain text</description>
      <link>https://myblog.com/article-two</link>
      <pubDate>Tue, 02 Jan 2024 12:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`;

const ATOM_XML = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Feed</title>
  <entry>
    <title>Atom Article</title>
    <summary>Summary text</summary>
    <link href="https://example.com/atom-article"/>
    <published>2024-01-03T12:00:00Z</published>
  </entry>
</feed>`;

describe('parseFeed', () => {
  it('parses RSS 2.0 channel title', () => {
    const { channelTitle } = parseFeed(RSS_XML, 'f1', 'My Blog');
    expect(channelTitle).toBe('My Blog');
  });

  it('parses RSS 2.0 articles', () => {
    const { articles } = parseFeed(RSS_XML, 'f1', 'My Blog');
    expect(articles).toHaveLength(2);
  });

  it('maps article fields correctly', () => {
    const { articles } = parseFeed(RSS_XML, 'f1', 'My Blog');
    const a = articles[0];
    expect(a.title).toBe('Article One');
    expect(a.link).toBe('https://myblog.com/article-one');
    expect(a.feedId).toBe('f1');
    expect(a.feedName).toBe('My Blog');
    expect(a.sourceDomain).toBe('myblog.com');
    expect(a.imageUrl).toBe('https://myblog.com/img.jpg');
    expect(a.pubDate).toBeInstanceOf(Date);
  });

  it('strips HTML from description', () => {
    const { articles } = parseFeed(RSS_XML, 'f1', 'My Blog');
    expect(articles[0].description).toBe('Hello world');
  });

  it('parses Atom feed title', () => {
    const { channelTitle } = parseFeed(ATOM_XML, 'f2', '');
    expect(channelTitle).toBe('Atom Feed');
  });

  it('parses Atom entries', () => {
    const { articles } = parseFeed(ATOM_XML, 'f2', '');
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('Atom Article');
    expect(articles[0].link).toBe('https://example.com/atom-article');
  });
});

describe('fetchFeed', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_WORKER_URL', 'https://proxy.example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('calls worker URL with encoded feed URL', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      text: async () => RSS_XML,
    });
    await fetchFeed('https://myblog.com/feed.xml', 'f1', 'My Blog');
    expect(fetch).toHaveBeenCalledWith(
      'https://proxy.example.com?url=https%3A%2F%2Fmyblog.com%2Ffeed.xml'
    );
  });

  it('throws on non-ok response', async () => {
    (fetch as any).mockResolvedValue({ ok: false, status: 404, text: async () => '' });
    await expect(fetchFeed('https://bad.com/feed.xml', 'f1', '')).rejects.toThrow('404');
  });

  it('passes abort signal to fetch when provided', async () => {
    (fetch as any).mockResolvedValue({ ok: true, text: async () => RSS_XML });
    const controller = new AbortController();
    await fetchFeed('https://myblog.com/feed.xml', 'f1', 'My Blog', controller.signal);
    expect(fetch).toHaveBeenCalledWith(
      'https://proxy.example.com?url=https%3A%2F%2Fmyblog.com%2Ffeed.xml',
      { signal: controller.signal }
    );
  });
});
