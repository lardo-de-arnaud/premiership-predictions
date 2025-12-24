export async function onRequest({ request, env }) {
  // Handle CORS preflight for Pages Functions
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  const url = new URL(request.url);
  // Strip /api prefix to get the actual endpoint path
  const apiPath = url.pathname.replace(/^\/api/, '');

  const BASE_URL = 'https://api.football-data.org';

  console.log('=== PROXY LOG START ===');
  console.log('Request URL:', request.url);
  console.log('Parsed pathname:', url.pathname);
  console.log('API path (after stripping /api):', apiPath);
  console.log('Search params:', url.search);
  console.log('Fetching from target URL:', `${BASE_URL}${apiPath}${url.search}`);

  const target = `${BASE_URL}${apiPath}${url.search}`;

  try {
    console.log('Making fetch request to:', target);
    const response = await fetch(target, {
      headers: {
        'X-Auth-Token': env.API_KEY,
        'Accept': 'application/json'
      }
    });

    console.log('Response received - Status:', response.status);
    console.log('Response.ok:', response.ok);
    console.log('Response headers:', JSON.stringify(Array.from(response.headers.entries())));

    const responseText = await response.text();
    console.log('Response body length:', responseText.length);
    console.log('Response body (first 1000 chars):', responseText.substring(0, 1000));

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('=== PROXY LOG END ===');

    // Return response with CORS headers so the static site can read it
    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  } catch (error) {
    console.error('Proxy error:', error.message);
    console.error('Stack:', error.stack);
    console.log('=== PROXY LOG END (WITH ERROR) ===');
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
