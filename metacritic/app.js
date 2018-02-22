'use strict';

var request = require('request')
    , cheerio = require('cheerio')
    , extend = require('extend');

var url = 'https://www.metacritic.com/'
    , urlSearchAll = 'search/{0}/{1}/results'
    , urlPage = '?page={0}'
    , currentPage = 0;

var opt = {
    category: 'all',
    text: '',
    page: 0,
    whole: false
};

//Search({ text: 'will smith', whole: false, category: 'all' }, function (err, list) {
//    list.forEach(function (v) {
//        console.log(v);
//    });
//});

//Search({ text: 'will smith', whole: false, category: 'person' }, function (err, list) {
//    list.forEach(function (v) {
//        console.log(v);
//    });
//});

//Search({ text: 'warner', whole: true, category: 'company' }, function (err, list) {
//    list.forEach(function (v) {
//        console.log(v);
//    });
//});

function Search(options, cb) {
    try {
        if (options.category)
            options.category = options.category.toLowerCase();

        extend(opt, options);

        var listTotal = [];

        if (options.whole) {
            SearchTotal(opt.text, opt.category, function (err, total) {
                var j = 0;

                for (var i = 0; i < total; i++) {
                    SearchCategory(opt.text, opt.category, function (err, list, page) {
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
            SearchCategory(opt.text, opt.category, cb, opt.page);
        }

        //switch (opt.category) {
        //    case 'all':
        //        if (options.whole) {
        //            SearchAllCategoryTotal(opt.text, function (err, total) {
        //                var j = 0;

        //                for (var i = 0; i < total; i++) {
        //                    SearchAllCategory(opt.text, function (err, list, page) {
        //                        j++;
        //                        listTotal[page] = list;

        //                        if (j == total) {
        //                            var final = listTotal.reduce((a, b) => a.concat(b), []);

        //                            cb(null, final);
        //                        }
        //                    }, i);
        //                }
        //            }, 0, true);
        //        } else {
        //            SearchAllCategory(opt.text, cb, opt.page);
        //        }
        //        break;

        //    case 'game':
        //        if (options.whole) {
        //            SearchGameTotal(opt.text, function (err, total) {
        //                var j = 0;

        //                for (var i = 0; i < total; i++) {
        //                    SearchGame(opt.text, function (err, list, page) {
        //                        j++;
        //                        listTotal[page] = list;

        //                        if (j == total) {
        //                            var final = listTotal.reduce((a, b) => a.concat(b), []);

        //                            cb(null, final);
        //                        }
        //                    }, i);
        //                }
        //            }, 0, true);
        //        } else {
        //            SearchGame(opt.text, cb, opt.page);
        //        }

        //        break;

        //    case 'movie':
        //        if (options.whole) {
        //            SearchGameTotal(opt.text, function (err, total) {
        //                var j = 0;

        //                for (var i = 0; i < total; i++) {
        //                    SearchGame(opt.text, function (err, list, page) {
        //                        j++;
        //                        listTotal[page] = list;

        //                        if (j == total) {
        //                            var final = listTotal.reduce((a, b) => a.concat(b), []);

        //                            cb(null, final);
        //                        }
        //                    }, i);
        //                }
        //            }, 0, true);
        //        } else {
        //            SearchGame(opt.text, cb, opt.page);
        //        }

        //        break;

        //    default:
        //        SearchAllCategory(opt.text, cb);
        //        break;

        //}

    } catch (e) {
        console.log(e);
    }
}

function SearchTotal(text, category, cb) {
    var finalUrl = url + urlSearchAll.replace('{0}', category).replace('{1}', text);

    RequestTotal(finalUrl, cb);
}

function SearchCategory(text, category, cb, page = 0) {
    var finalUrl = url + urlSearchAll.replace('{0}', category).replace('{1}', text) + urlPage.replace('{0}', page);

    RequestSearch(finalUrl, cb, page);
}

//function SearchGameTotal(text, cb) {
//    var finalUrl = url + urlSearchAll.replace('{0}', 'game').replace('{1}', text);

//    RequestTotal(finalUrl, cb);
//}

//function SearchGame(text, cb, page = 0) {
//    var finalUrl = url + urlSearchAll.replace('{0}', 'game').replace('{1}', text) + urlPage.replace('{0}', page);

//    RequestSearch(finalUrl, cb, page);
//}

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
        cb(e);
    }).end();
}

function GetData($) {
    var list = [];

    $('.result').filter(function () {
        var product = {};

        var data = $(this);
        var Title = data.find('.product_title a');
        var Type = data.find('.result_type');

        //General
        var type = Type.find('strong').text().trim();
        var platform = Type.find('.platform').text().trim();
        var title = Title.text().trim();
        var link = url + Title.attr('href');
        var releaseDate = data.find('.release_date').find('.data').text().trim();
        var rated = data.find('.rated').find('.data').text().trim();
        var publisher = data.find('.publisher').find('.data').text().trim();
        var cast = data.find('.cast').find('.data').text().trim().replace(/                                                             /g, ' ');
        var genre = data.find('.genre').find('.data').text().trim().replace(/                                                             /g, ' ');
        var userScore = data.find('.product_avguserscore').find('.data').text().trim();
        var runtime = data.find('.runtime').find('.data').text().trim();
        var summary_short = data.find('.deck').text().trim();
        var metascore = data.find('.metascore_w').text().trim();

        if (type != '')
            product.type = type;
        if (platform != '')
            product.platform = platform;
        if (title != '')
            product.title = title;
        if (link != '')
            product.link = link;
        if (type !== 'People' && releaseDate != '')
            product.releaseDate = releaseDate;
        if (rated != '')
            product.rated = rated;
        if (publisher != '')
            product.publisher = publisher;
        if (cast != '')
            product.cast = cast;
        if (genre != '')
            product.genre = genre;
        if (userScore != '')
            product.userScore = userScore;
        if (runtime != '')
            product.runtime = runtime;
        if (summary_short != '')
            product.summary_short = summary_short;
        if (metascore != '')
            product.metascore = metascore;

        //Person
        if (opt.category === 'person' || opt.category === 'all') {
            var scores = data.find('.avg_career_score');

            scores.each(function (i, elem) {
                if ($(this).find('.label').text().trim() === 'Average career score:')
                    product.careerScore = $(this).find('.data').text().trim();
                else if ($(this).find('.label').text().trim() === 'Average Movie career score:')
                    product.movieCareerScore = $(this).find('.data').text().trim();
                else if ($(this).find('.label').text().trim() === 'Average Album career score:')
                    product.albumCareerScore = $(this).find('.data').text().trim();
                else if ($(this).find('.label').text().trim() === 'Average TV Show career score:')
                    product.tvShowCareerScore = $(this).find('.data').text().trim();
            });

            var categories = data.find('.categories').find('.data').text().trim();
            var born = data.find('.release_date').find('.data').text().trim();

            if (categories != '')
                product.categories = categories;

            if (type === 'People' && born != '')
                product.born = born;
        }

        //Company
        if (opt.category === 'company' || opt.category === 'all') {

            if (product.careerScore == '') {
                var scores = data.find('.avg_career_score');

                scores.each(function (i, elem) {
                    if ($(this).find('.label').text().trim() === 'Average career score:')
                        product.careerScore = $(this).find('.data').text().trim();
                });
            }

            var latestProduct = data.find('.latest_product').find('.data').text().trim();
            if (latestProduct != '')
                product.latestProduct = latestProduct;
        }

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
    Search: Search
};
