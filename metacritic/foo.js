const metacritic = require('./app');

metacritic.Search({ text: 'hyper', category: 'game', platformId: 268409 }, function (err, list) {
    console.log(list);
});