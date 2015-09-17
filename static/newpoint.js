
/**
 * Parse URL parameters.
 * Copied from Stack Overflow
 */
function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") {
        return parms;
    }

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) {
            parms[n] = [];
        }

        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function initialize() {
    // We parse a number of url parameters here because for now we
    // don't want to use templates on the server.
    var urlParams = parseURLParams(window.location.href);
    if (urlParams.hasOwnProperty('lat')) {
        document.getElementById('lat').value = urlParams['lat'];
    }
    if (urlParams.hasOwnProperty('lng')) {
        document.getElementById('lng').value = urlParams['lng'];
    }
    if (urlParams.hasOwnProperty('error')) {
        document.getElementById('error').textContent = urlParams['error'];
    }
}

window.addEventListener('load', initialize);
