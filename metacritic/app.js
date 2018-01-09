'use strict';

var Crawler = require("crawler");

console.log(Crawl());


function Crawl() {
    var c = new Crawler({
        maxConnections: 10,
        // This will be called for each crawled page
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            } else {
                var $ = res.$;
                // $ is Cheerio by default
                //a lean implementation of core jQuery designed specifically for the server
                console.log($("title").text());
            }
            done();
        }
    });

    c.queue('http://www.google.com');
    //c.queue('http://www.metacritic.com/browse/games/title/pc?page=1');
}

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 */
module.exports = {
    crawl: Crawl()
};