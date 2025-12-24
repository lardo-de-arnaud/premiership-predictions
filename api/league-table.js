export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // adjust path if needed (keeps query string, e.g. ?comp=1)
    console.log("Fetching from target URL: " + `https://football-web-pages1.p.rapidapi.com${url.pathname}${url.search}`);
    const target = `https://football-web-pages1.p.rapidapi.com${url.pathname}${url.search}`;

    const resp = await fetch(target, {
      headers: {
        "X-RapidAPI-Key": env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "football-web-pages1.p.rapidapi.com",
        "Accept": "application/json"
      }
    });

    // return response with CORS headers so your static site can read it
    return new Response(await resp.text(), {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://premiership-predictions.pages.dev", // your site
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }
};
