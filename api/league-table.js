export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Strip /api prefix to get the actual endpoint path
    const apiPath = url.pathname.replace(/^\/api/, '');
    console.log("Fetching from target URL: " + `https://football-web-pages1.p.rapidapi.com${apiPath}${url.search}`);
    const target = `https://football-web-pages1.p.rapidapi.com${apiPath}${url.search}`;

    const resp = await fetch(target, {
      headers: {
        "X-RapidAPI-Key": env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "football-web-pages1.p.rapidapi.com",
        "Accept": "application/json"
      }
    });

    console.log("Response status:", resp.status);
    const responseText = await resp.text();
    console.log("Response body:", responseText);

    // return response with CORS headers so your static site can read it
    return new Response(responseText, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://premiership-predictions.pages.dev", // your site
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }
};
