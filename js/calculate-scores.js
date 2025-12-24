/*
  calculate-scores.js
  Rewritten client-side code. This file **does NOT** contain an API key.
  You MUST configure PROXY_URL to point at a server-side proxy (Vercel/Netlify/Cloudflare Worker, etc.)
  which performs the RapidAPI request and returns JSON with CORS headers. See README.md for instructions.
*/

(function() {
    // CONFIG: set this to your proxy endpoint (server-side) that adds the RapidAPI headers.
    // Example: "https://football-proxy.vercel.app/api/league-table.json"
    // The proxy must call RapidAPI server-side and return JSON.
    var PROXY_URL = "https://premiership-predictions.pages.dev/api/league-table.json"; 

    var lowest = 10000;
    var lowestName = "";

    var highest = 0;
    var highestName = "";

    var olAllScores = $("<ol>");
    var allScoresList = [];

    // position-1 of each team
    var position = {};

    function hashCode(str) {
        var hash = 0;
        if (!str || str.length === 0) return hash;
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    $(document).ready(function() {
        if (!PROXY_URL || PROXY_URL.indexOf("<your-proxy-host>") !== -1) {
            console.error("PROXY_URL not set. Please set PROXY_URL to your proxy endpoint that forwards the request to RapidAPI.");
            $("#current-table").append("<p style='display:inline-block; border:2px solid red; padding:10px; background-color:#ffecec; color:#900; border-radius:4px;'><b>Error:</b> PROXY_URL not configured. Tell Adam to get his finger out and fix it!</p>");
            return;
        }

        // Use fetch to call the proxy. Proxy must not require special client headers.
        fetch(PROXY_URL + "?comp=1", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "omit"
        })
        .then(function(resp) {
            if (!resp.ok) {
                throw new Error("Proxy returned status " + resp.status + ": " + resp.statusText);
            }
            return resp.json();
        })
        .then(function(data) {
            // expected structure: data['league-table'].teams (as before)
            if (data && data['league-table'] && Array.isArray(data['league-table'].teams)) {
                var i = 0;
                var ol = $("<ol id='table'>");
                $.each(data['league-table'].teams, function(key, team) {
                    // guard against missing name
                    var teamName = team && team.name ? team.name : ("team-" + i);
                    position[teamName] = i++;
                    ol.append("<li id='" + escapeHtmlAttr(teamName) + "'>" + escapeHtml(teamName) + "</li>");
                });
                $("#current-table").empty().append(ol);
            } else {
                $("#current-table").append("<p>Current table not available.</p>");
                return;
            }

            // Now calculate scores and display
            $("ol.ui-sortable").each(function() {
                var name = $(this).attr("id") || "unknown";
                var score = 0;
                var pos = 0;
                $(this).find('li').each(function() {
                    var team = $(this).attr('id');
                    if (typeof position[team] !== "number") {
                        // team not found in the official table — log it and skip
                        console.warn("Team not found in official table:", team);
                    } else {
                        score += Math.abs(pos - position[team]);
                    }
                    pos++;
                });

                // write out current score (insert before this list)
                $("<p><b>Score = " + score + "</b></p>").insertBefore($(this));
                var pad = "000";
                var scoreStr = "" + score;
                var paddedScore = pad.substring(0, pad.length - scoreStr.length) + scoreStr;
                allScoresList.push("<li data-score='" + paddedScore + "'><a href='#" + hashCode(name) + "'>" + escapeHtml(name) + "</a> = " + score + "</li>");

                if (score <= lowest) {
                    if (score == lowest) {
                        lowestName += " & " + name;
                    } else {
                        lowestName = name;
                    }
                    lowest = score;
                }

                if (score >= highest) {
                    if (score == highest) {
                        highestName += " & " + name;
                    } else {
                        highestName = name;
                    }
                    highest = score;
                }
            });

            $("#current-scores").append("<p>Lowest score is: " + escapeHtml(lowestName) + " (" + lowest + ")</p>");
            $("#current-scores").append("<p>Highest score is: " + escapeHtml(highestName) + " (" + highest + ")</p>");

            allScoresList = allScoresList.sort();
            for (var j = 0; j < allScoresList.length; j++) {
                olAllScores.append(allScoresList[j]);
            }
            $("#current-scores").append(olAllScores);
        })
        .catch(function(err) {
            console.error("Failed to fetch league table:", err);
            $("#current-table").append("<p style='display:inline-block; border:2px solid red; padding:10px; background-color:#ffecec; color:#900; border-radius:4px;'><b>Error:</b> Failed to fetch league table: " + escapeHtml(err.message) + "</p>");
        });

        // helper: escape HTML for safety in insertion
        function escapeHtml(text) {
            if (text === undefined || text === null) return "";
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }
        function escapeHtmlAttr(text) {
            return escapeHtml(text).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); 
        }
    });
})();
