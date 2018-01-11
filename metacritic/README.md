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

metacritic.SearchAll({ text: 'spider-man' }, function (err, list) {

});

```

## Options

| Property | Description | Default |
| --- | --- | --- |
| `category` | All or Game | All |
| `text` | Text for searching e.g Spider-Man | |
| `page` | Page number | 0 |
| `whole` | If you want to get the whole list instead of just the first page | false |
