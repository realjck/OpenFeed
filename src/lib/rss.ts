import { XMLParser } from 'fast-xml-parser';
import type { Article } from '../types';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['item', 'entry', 'link'].includes(name),
});

function decodeEntities(text: string): string {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

function stripHtml(html: string): string {
  const decoded = decodeEntities(html);
  return decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractImageFromHtml(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export interface ParsedFeed {
  channelTitle: string;
  siteUrl: string;
  articles: Article[];
}

export function parseFeed(
  xml: string,
  feedId: string,
  feedName: string
): ParsedFeed {
  const parsed = parser.parse(xml);

  // Atom feed
  if (parsed.feed) {
    const feed = parsed.feed;
    const channelTitle: string = feed.title ?? feedName;
    const feedLinks: any[] = Array.isArray(feed.link) ? feed.link : [];
    const altLink = feedLinks.find((l: any) => typeof l === 'object' && (!l['@_rel'] || l['@_rel'] === 'alternate'));
    const siteUrl: string = altLink?.['@_href'] ?? '';
    const entries = feed.entry ?? [];
    const articles: Article[] = entries.map((entry: any) => {
      const linkArr: any[] = Array.isArray(entry.link) ? entry.link : [entry.link];
      const linkObj = linkArr.find((l: any) => typeof l === 'object' && l['@_href']);
      const link: string = linkObj ? linkObj['@_href'] : (typeof linkArr[0] === 'string' ? linkArr[0] : '');
      const rawContent = entry.summary ?? entry.content;
      const rawDesc: string = rawContent !== null && typeof rawContent === 'object'
        ? String(rawContent['#text'] ?? '')
        : String(rawContent ?? '');
      return {
        feedId,
        feedName,
        title: decodeEntities(String(entry.title ?? '')),
        description: stripHtml(rawDesc),
        link,
        pubDate: new Date(entry.published ?? entry.updated ?? 0),
        imageUrl: extractImageFromHtml(rawDesc),
        sourceDomain: getDomain(link),
      };
    });
    return { channelTitle, siteUrl, articles };
  }

  // RSS 2.0
  const channel = parsed?.rss?.channel ?? {};
  const channelTitle: string = channel.title ?? feedName;
  const channelLinks: any[] = Array.isArray(channel.link) ? channel.link : [];
  const siteUrl: string = channelLinks.find((l: any) => typeof l === 'string') ?? '';
  const items: any[] = channel.item ?? [];
  const articles: Article[] = items.map((item: any) => {
    const rawLink = item.link;
    const link: string = Array.isArray(rawLink) ? (rawLink[0] ?? '') : (rawLink ?? '');
    const rawDesc: string = String(item.description ?? '');
    const enclosureUrl: string | undefined =
      item.enclosure?.['@_url'] &&
      String(item.enclosure['@_type'] ?? '').startsWith('image/')
        ? item.enclosure['@_url']
        : undefined;
    return {
      feedId,
      feedName,
      title: decodeEntities(String(item.title ?? '')),
      description: stripHtml(rawDesc),
      link,
      pubDate: new Date(item.pubDate ?? 0),
      imageUrl: enclosureUrl ?? extractImageFromHtml(rawDesc),
      sourceDomain: getDomain(link),
    };
  });
  return { channelTitle, siteUrl, articles };
}

export async function fetchFeed(
  url: string,
  feedId: string,
  feedName: string,
  signal?: AbortSignal
): Promise<ParsedFeed> {
  const workerUrl = import.meta.env.VITE_WORKER_URL;
  const fetchUrl = `${workerUrl}?url=${encodeURIComponent(url)}`;
  const response = signal
    ? await fetch(fetchUrl, { signal })
    : await fetch(fetchUrl);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const xml = await response.text();
  return parseFeed(xml, feedId, feedName);
}
