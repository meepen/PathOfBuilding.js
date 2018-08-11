const axios = require("axios");
const http = require("http");
const url = require("url");

const cfg = require("./config");

http.createServer((req, res) => {
    var query;
    try {
        var parsed = url.parse(req.url, true);
        query = parsed.query;
    }
    catch (e) {
        res.statusCode = 503;
        return res.end();
    }

    if (query.url === undefined) {
        res.statusCode = 503;
        return res.end();
    }

    axios({
        method: "get",
        url: query.url,
        responseType: "stream"
    }).then(get => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        get.data.pipe(res);
    }).catch(e => {
        console.log(e);
        res.statusCode = 503;
        return res.end();
    });

}).listen(cfg.port, cfg.hostname);

console.log(`listening on http://${cfg.hostname}:${cfg.port}`);