'use strict';
var http = require('http');
var metacritic = require('metacritic');

var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    metacritic.SearchAll({ text: 'spider-man', whole: true }, function (err, list) {
        var a = list;
    });

    res.end(result);
}).listen(port);
