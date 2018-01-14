# node-metacritic

## What is it?

Metacritic is designed to be the simplest way to get data from metacritic.com.

## Intall

```
npm install metacritic

```

## Using

```
var metacritic = require('metacritic');

metacritic.Search({ text: 'spider-man' }, function (err, list) {

});

```

## Options

| Property | Description | Default |
| --- | --- | --- |
| `category` | all, movie, game, album, tv(TV show), person, video(Trailer), company | all |
| `text` | Text for searching e.g Spider-Man, Will Smith, Warner | |
| `page` | Page number | 0 |
| `whole` | If you want to get the whole list instead of just the first page | false |
