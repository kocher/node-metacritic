'use strict';
var http = require('http');
var metacritic = require('metacritic');

var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    var result = metacritic.escape2('aaaaa&bbbb"cccc');

    res.end(result);
}).listen(port);
