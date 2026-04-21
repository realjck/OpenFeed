export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function extractHostname(url: string): string {
  try { return new URL(url).hostname; } catch { return ''; }
}

export function getFeedIconUrl(feedUrl: string, siteUrl?: string): string {
  const domain = (siteUrl && extractHostname(siteUrl)) || extractHostname(feedUrl);
  return domain ? getFaviconUrl(domain) : '';
}
