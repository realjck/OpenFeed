import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['outline'].includes(name),
});

export interface OPMLFeed {
  name: string;
  url: string;
}

export function parseOPML(xml: string): OPMLFeed[] {
  const parsed = parser.parse(xml);
  const feeds: OPMLFeed[] = [];

  function walk(nodes: any[]) {
    for (const node of nodes) {
      if (node['@_type'] === 'rss' || node['@_xmlUrl']) {
        feeds.push({
          name: node['@_text'] || node['@_title'] || 'Untitled Feed',
          url: node['@_xmlUrl'],
        });
      }
      if (node.outline) {
        walk(Array.isArray(node.outline) ? node.outline : [node.outline]);
      }
    }
  }

  const body = parsed.opml?.body;
  if (body?.outline) {
    walk(Array.isArray(body.outline) ? body.outline : [body.outline]);
  }

  return feeds;
}

export async function fetchOPML(url: string): Promise<OPMLFeed[]> {
  const workerUrl = import.meta.env.VITE_WORKER_URL;
  const response = await fetch(`${workerUrl}?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const xml = await response.text();
  return parseOPML(xml);
}
