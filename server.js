// index.js
var falcorExpress = require('falcor-express');
var Router = require('falcor-router');
var fetch = require('node-fetch');

var express = require('express');
var app = express();

app.use('/model.json', falcorExpress.dataSourceRoute((req, res) => {
  // create a Virtual JSON resource with single key ("greeting")
  return new Router([
    {
      // match a request for the key "greeting"
      route: 'greeting',
      // respond with a PathValue with the value of "Hello World."
      get() {
        return fetch('http://pokeapi.co/api/v1/pokemon/1')
          .then(response => response.json())
          .then(value => ({
            path: ['greeting'], value
          }));
      }
    }
  ]);
}));

// serve static files from current directory
app.use(express.static(__dirname + '/'));

console.log('Server listening on http://localhost:3000');
var server = app.listen(3000);
