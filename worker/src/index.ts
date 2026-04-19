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

    const response = await fetch(targetUrl.toString(), {
      headers: { 'User-Agent': 'OpenFeed/1.0 RSS Reader' },
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
