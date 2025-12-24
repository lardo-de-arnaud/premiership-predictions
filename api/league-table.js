export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Strip /api prefix to get the actual endpoint path
    const apiPath = url.pathname.replace(/^\/api/, '');

    const BASE_URL = 'https://api.footballwebpages.co.uk/v2';

    console.log("Fetching from target URL: " + `${BASE_URL}${apiPath}${url.search}`);

    const target = `${BASE_URL}${apiPath}${url.search}`;

    const response = await fetch(target, {
      headers: {
        "FWP-API-Key": env.RAPIDAPI_KEY,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("Response body:", responseText);

    // return response with CORS headers so your static site can read it
    return new Response(responseText, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://premiership-predictions.pages.dev", // your site
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }
};
