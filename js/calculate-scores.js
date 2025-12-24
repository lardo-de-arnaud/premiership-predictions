

(function() {

    // Proxy base; the function strips the /api prefix and forwards to football-data.org
    var PROXY_URL = "/api"; 

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
        if (!PROXY_URL || PROXY_URL.trim() === ""  ) {
            console.error("PROXY_URL not set.");
            return;
        }

        // Use fetch to call the proxy. Proxy must not require special client headers.
        console.log("=== CLIENT LOG START ===");
        console.log("Calling proxy URL:", PROXY_URL + "/v4/competitions/PL/standings");
        
        fetch(PROXY_URL + "/v4/competitions/PL/standings", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "omit"
        })
        .then(function(resp) {
            
            if (!resp.ok) {
                console.error("Response not ok! Throwing error");
                throw new Error("Proxy returned status " + resp.status + ": " + resp.statusText);
            }
            
            // First, get the response as text to log it
            return resp.text().then(function(text) {
                console.log("Raw response body:", text);

                // Now try to parse it as JSON
                try {
                    const jsonData = JSON.parse(text);
                    return jsonData;
                } catch (e) {
                    console.error("Failed to parse JSON:", e.message);
                    console.error("First 500 chars of response:", text.substring(0, 500));
                    throw new Error("Response is not valid JSON: " + e.message);
                }
            });
        })
        .then(function(data) {

            console.log("Data received from proxy:", data);
            
            // New API structure: data.standings[0].table
            if (data && data.standings && Array.isArray(data.standings) && 
                data.standings[0] && Array.isArray(data.standings[0].table)) {
                console.log("=== STANDINGS TABLE ===");
                var table = data.standings[0].table;
                table.forEach(function(entry, index) {
                    console.log("Position " + index + ": " + entry.team.shortName);
                });
                console.log("=== END STANDINGS TABLE ===");
                
                var i = 0;
                var ol = $("<ol id='table'>");
                $.each(table, function(key, entry) {
                    var teamName = entry.team.shortName;
                    position[teamName] = i++;
                    ol.append("<li id='" + escapeHtmlAttr(teamName) + "'>" + escapeHtml(teamName) + "</li>");
                });
                $("#current-table").empty().append(ol);
            } else {
                console.error("Unexpected data structure:", data);
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
                        // show error at top of page
                        $("body").prepend("<p style='border:2px solid red; padding:8px; background:#ffecec; color:#900; border-radius:4px;'><b>" + escapeHtml(team) + " has the wrong ID</b></p>");
                    } else {
                        console.log("Team " + team + ": official position " + position[team] + ", user position " + pos);
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
