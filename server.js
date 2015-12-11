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
      route: 'pokemon[{keys:range}].[{keys:props}]',
      // respond with a PathValue with the value of "Hello World."
      get(pathSet) {
        console.log(pathSet);
        const props = pathSet.props;
        return fetchPokeApi('api/v1/pokedex/1/')
          .then(response => pathSet.range
            .map(i => {
              const pokemonResource = response.pokemon[i].resource_uri;
              const pokemonProps = fetchPropsFromResource(props, pokemonResource);
              return pokemonProps.then(value => ({path: [pathSet[0], i], value}));
            })
          )
          .then(resultPromises => Promise.all(resultPromises));
      }
    }
  ]);
}));

function fetchPropsFromResource(props, resource) {
  return fetchPokeApi(resource)
    .then(response => {
        const result = {};
        props.map(prop => {
          return result[prop] = response[prop]
        });
        return result;
      }
    );
}

const endpoint = 'http://pokeapi.co/';
function fetchPokeApi(resource) {
  return fetch(`${endpoint}${resource}`)
    .then(response => response.json());
}

// serve static files from current directory
app.use(express.static(__dirname + '/'));

console.log('Server listening on http://localhost:3000');
var server = app.listen(3000);
