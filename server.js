'use strict';
// index.js
var falcorExpress = require('falcor-express');
var jsong = require('falcor-json-graph');
var Router = require('falcor-router');
var fetch = require('node-fetch');
var jsonGraph = require('jsongraph');

var express = require('express');
var app = express();

function filter(list, range) {
  const result = [];
  for(var i = range.from; i <= range.to; i++) {
    result.push(list[i]);
  }
  return result;
}

function parseId(resource) {
  console.log(resource);
  return /(\d+)\/$/.exec(resource)[1];
}

app.use('/model.json', falcorExpress.dataSourceRoute((req, res) => {
  // create a Virtual JSON resource with single key ("greeting")
  return new Router([
    {
      // match a request for the key "greeting"
      route: 'pokedex[{keys:range}]',
      get(pathSet) {
        return fetchPokeApi('api/v1/pokedex/1/')
          .then(response => pathSet.range
            .map(i => {
              const pokemonResource = response.pokemon[i];
              const id = parseId(pokemonResource.resource_uri);
              return {path: [pathSet[0], i], value: jsong.ref(['pokemonById', id])}
            })
          );
      }
    },
    {
      // match a request for the key "greeting"
      route: 'pokemonById[{keys:ids}][{keys:props}]',
      get(pathSet) {
        const props = pathSet.props;
        const pokemonPromises = pathSet.ids
          .map(id => {
            const pokemonProps = fetchPropsFromResource(props, `api/v1/pokemon/${id}/`);
            return pokemonProps.then(value => ({path: [pathSet[0], id], value}));
          });

        return Promise.all(pokemonPromises);
      }
    },
    {
      route: 'type[{integers:typeId}]',
      get(pathSet) {
        return fetchPokeApi(`api/v1/type/${pathSet.typeId[0]}/`)
          .then(function (response) {
            return {
              path: ['type'], value: response.name
            };
          });
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
