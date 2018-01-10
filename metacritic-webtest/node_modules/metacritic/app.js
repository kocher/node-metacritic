'use strict';

var request = require('request')
, cheerio = require('cheerio')
, extend = require('extend');

var url = 'https://www.metacritic.com/'
, urlSearchAll = 'search/{0}/{1}/results'
, urlGames = 'browse/games/'
, urlPage = '?page={0}'
, currentPage = 0;

console.log(SearchAll({ text: 'spider-man', whole: true }, function (err, list) {
    var a = list;
}));

function SearchAll(options, cb) {
    try {
        var opt = {
            category: 'all',
            text: '',
            page: 0,
            whole: false
        };

        extend(opt, options);

        if (options.whole) {
            var listTotal = [];
            switch (opt.category) {
                case 'all':
                    SearchAllCategories(opt.text, function (err, total) {
                        var j = 0;

                        for (var i = 0; i < total; i++) {
                            SearchAllCategories(opt.text, function (err, list, page) {
                                j++;
                                listTotal[page] = list;

                                if (j == total) {
                                    var final = listTotal.reduce((a, b) => a.concat(b), []);

                                    cb(null, final);
                                }
                            }, i);
                        }
                    }, 0, true);
                    break;
                case 'games':
                    SearchGame(opt.text, cb, opt.page);
                    break;
                default:
                    SearchAllCategories(opt.text, cb);
            }
        } else {
            switch (opt.category) {
                case 'all':
                    SearchAllCategories(opt.text, cb, opt.page);
                case 'games':
                    SearchGame(opt.text, cb, opt.page);

                default:
                    SearchAllCategories(opt.text, cb);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

function SearchAllCategories(text, cb, page = 0, justTotal = false) {
    var finalUrl = url + urlSearchAll.replace('{0}', 'all').replace('{1}', text) + urlPage.replace('{0}', page);

    request(finalUrl, function (err, response, html) {
        if (!err) {
            var $ = cheerio.load(html);

            if (justTotal) {
                var total = GetTotal($);
                cb(null, total);
                return;
            }

            var list = GetData($);

            if (list.length == 0) {
                cb('No results');
                return;
            }

            cb(null, list, page);

        } else {
            cb(err);
        }
    }).on('error', function (e) {
        cb(error);
    }).end();
}

function SearchGame(text, cb, page = 0, justTotal = false) {
    var finalUrl = url + urlSearchAll.replace('{0}', 'game').replace('{1}', text) + urlPage.replace('{0}', page);

    request(finalUrl, function (err, response, html) {
        if (!err) {
            var $ = cheerio.load(html);

            if (justTotal) {
                var total = GetTotal($);
                cb(null, total);
                return;
            }

            var list = GetData($);

            if (list.length == 0) {
                cb('No results');
                return;
            }

            cb(null, list);
        } else {
            cb(err);
        }
    }).on('error', function (e) {
        cb(error);
    }).end();
}

function Search2(text, cb) {

    request(url + urlSearch.replace('{0}', text), function (error, response, html) {
        if (!error) {
            //console.error('Page: ' + page);

            var $ = cheerio.load(html);

            //if ($('.cg-game').length == 0) {
            //    cb();
            //}

            var list = []

            $('.product_title').filter(function () {
                var game = { link: "" };

                var data = $(this);
                var a = data.find('a');
                var title = a.text().trim();
                var link = a.attr('href');

                game.link = link;
                list.push(game);
            })

            if (list.length == 0) {
                cb();
                return;
            }
        } else {
            console.error('Error: ' + error);

            //cb(error);
        }
    }).on('error', function (e) {
        console.error('Error: ' + e);
    }).end();
}

function GetTotal($) {
    var lastCount = $('.page_num').last();
    
    return lastCount.text().trim();
}

function GetData($) {
    var list = [];

    $('.result').filter(function () {
        var product = {};

        var data = $(this);
        var a = data.find('.product_title a');

        product.type = data.find('.result_type').find('strong').text().trim();
        product.title = a.text().trim();
        product.link = url + a.attr('href');
        product.releaseDate = data.find('.release_date').find('.data').text().trim();
        product.rated = data.find('.rated').find('.data').text().trim();
        product.publisher = data.find('.publisher').find('.data').text().trim();
        product.cast = data.find('.cast').find('.data').text().trim().replace(/                                                             /g, ' ');
        product.genre = data.find('.genre').find('.data').text().trim().replace(/                                                             /g, ' ');
        product.userScore = data.find('.product_avguserscore').find('.data').text().trim();
        product.runtime = data.find('.runtime').find('.data').text().trim();
        product.short_description = data.find('.deck').text().trim();
        product.metascore = data.find('.metascore_w').text().trim();

         
        list.push(product);
    });

    return list;
}

/**
 * Search for data on metacritic.
 */
module.exports = {
    /**
     * Search for data on metacritic.
     *
     * @param  {Object} options
     * @param  {Function} cb
     */
    SearchAll: SearchAll,
    SearchAllCategories: SearchAllCategories,
    SearchGame: SearchGame
};