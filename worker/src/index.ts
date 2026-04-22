export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const feedUrl = url.searchParams.get('url');

    if (!feedUrl) {
      return new Response('Missing ?url= parameter', { status: 400, headers: corsHeaders() });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(feedUrl);
    } catch {
      return new Response('Invalid URL', { status: 400, headers: corsHeaders() });
    }

    const acceptLanguage = request.headers.get('Accept-Language') ?? 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7';

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': acceptLanguage,
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Referer': targetUrl.origin,
      },
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': response.headers.get('Content-Type') ?? 'application/xml',
        'Cache-Control': 'max-age=300',
      },
    });
  },
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
