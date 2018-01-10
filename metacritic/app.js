'use strict';

var request = require('request')
    , cheerio = require('cheerio')
    , extend = require('extend');

var url = 'https://www.metacritic.com/'
    , urlSearchAll = 'search/{0}/{1}/results'
    , urlGames = 'browse/games/'
    , urlPage = '?page={0}'
    , currentPage = 0;

//SearchAll({ text: 'spider-man', whole: true }, function (err, list) {
//    console.log('Finish');

//});

function SearchAll(options, cb) {
    try {
        var opt = {
            category: 'all',
            text: '',
            page: 0,
            whole: false
        };

        extend(opt, options);

        var listTotal = [];

        switch (opt.category) {
            case 'all':
                if (options.whole) {
                    SearchAllCategoryTotal(opt.text, function (err, total) {
                        var j = 0;

                        for (var i = 0; i < total; i++) {
                            SearchAllCategory(opt.text, function (err, list, page) {
                                j++;
                                listTotal[page] = list;

                                if (j == total) {
                                    var final = listTotal.reduce((a, b) => a.concat(b), []);

                                    cb(null, final);
                                }
                            }, i);
                        }
                    }, 0, true);
                } else {
                    SearchAllCategory(opt.text, cb, opt.page);
                }
                break;

            case 'games':
                if (options.whole) {
                    SearchGameTotal(opt.text, function (err, total) {
                        var j = 0;

                        for (var i = 0; i < total; i++) {
                            SearchGame(opt.text, function (err, list, page) {
                                j++;
                                listTotal[page] = list;

                                if (j == total) {
                                    var final = listTotal.reduce((a, b) => a.concat(b), []);

                                    cb(null, final);
                                }
                            }, i);
                        }
                    }, 0, true);
                } else {
                    SearchGame(opt.text, cb, opt.page);
                }

                break;

            default:
                SearchAllCategory(opt.text, cb);
                break;

        }
    } catch (e) {
        console.log(e);
    }
}

function SearchAllCategoryTotal(text, cb) {
    var finalUrl = url + urlSearchAll.replace('{0}', 'all').replace('{1}', text);

    RequestTotal(finalUrl, cb);
}

function SearchAllCategory(text, cb, page = 0) {
    var finalUrl = url + urlSearchAll.replace('{0}', 'all').replace('{1}', text) + urlPage.replace('{0}', page);

    RequestSearch(finalUrl, cb, page);
}

function SearchGameTotal(text, cb) {
    var finalUrl = url + urlSearchAll.replace('{0}', 'game').replace('{1}', text);

    RequestTotal(finalUrl, cb);
}

function SearchGame(text, cb, page = 0) {
    var finalUrl = url + urlSearchAll.replace('{0}', 'game').replace('{1}', text) + urlPage.replace('{0}', page);

    RequestSearch(finalUrl, cb, page);
}

function RequestTotal(url, cb) {
    request(url, function (err, response, html) {
        if (!err) {
            var $ = cheerio.load(html);

            var lastCount = $('.page_num').last();

            var total = lastCount.text().trim();

            cb(null, total);
        } else {
            cb(err);
        }
    }).on('error', function (e) {
        cb(error);
    }).end();
}

function RequestSearch(url, cb, page) {
    request(url, function (err, response, html) {
        if (!err) {
            var $ = cheerio.load(html);

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

function GetData($) {
    var list = [];

    $('.result').filter(function () {
        var product = {};

        var data = $(this);
        var Title = data.find('.product_title a');
        var Type = data.find('.result_type');

        product.type = Type.find('strong').text().trim();
        product.platform = Type.find('.platform').text().trim();
        product.title = Title.text().trim();
        product.link = url + Title.attr('href');
        product.releaseDate = data.find('.release_date').find('.data').text().trim();
        product.rated = data.find('.rated').find('.data').text().trim();
        product.publisher = data.find('.publisher').find('.data').text().trim();
        product.cast = data.find('.cast').find('.data').text().trim().replace(/                                                             /g, ' ');
        product.genre = data.find('.genre').find('.data').text().trim().replace(/                                                             /g, ' ');
        product.userScore = data.find('.product_avguserscore').find('.data').text().trim();
        product.runtime = data.find('.runtime').find('.data').text().trim();
        product.summary_short = data.find('.deck').text().trim();
        product.metascore = data.find('.metascore_w').text().trim();

        list.push(product);
    });

    return list;
}

module.exports = {
    /**
     * Search for All data on metacritic.
     *
     * @param  {Object} options
     * @param  {Function} cb
     */
    SearchAll: SearchAll,
    SearchAllCategory: SearchAllCategory,
    SearchGame: SearchGame
};