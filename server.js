'use strict';
// index.js
var falcorExpress = require('falcor-express');
var Router = require('falcor-router');
var fetch = require('node-fetch');

var express = require('express');
var app = express();

function filter(list, range) {
  const result = [];
  for(var i = range.from; i <= range.to; i++) {
    result.push(list[i]);
  }
  return result;
}

app.use('/model.json', falcorExpress.dataSourceRoute((req, res) => {
  // create a Virtual JSON resource with single key ("greeting")
  return new Router([
    {
      // match a request for the key "greeting"
      route: 'pokemon[{ranges:indexRanges}].["name", "species"]',
      // respond with a PathValue with the value of "Hello World."
      get(pathSet) {
        const result = [];
        const range = pathSet.indexRanges[0];
        for(var i = range.from; i <= range.to; i++) {
          result.push({path: ['pokemon', i, ['name', 'species']], value: 'ssdsdf'});
        }
        return Promise.resolve(result);
      }
    }

  ]);
}));

// serve static files from current directory
app.use(express.static(__dirname + '/'));

console.log('Server listening on http://localhost:3000');
var server = app.listen(3000);
