'use strict';
// index.js
var falcorExpress = require('falcor-express');
var jsong = require('falcor-json-graph');
var Router = require('falcor-router');
var fetch = require('node-fetch');

var express = require('express');
var app = express();

function parseId(resource) {
  return /(\d+)\/$/.exec(resource)[1];
}

app.use('/model.json', falcorExpress.dataSourceRoute((req, res) => {
  return new Router([
    {
      route: 'pokedex[{keys:range}]',
      get(pathSet) {
        console.log(pathSet);
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
      route: 'pokemonById[{keys:ids}][{keys:props}]',
      get(pathSet) {
        console.log('pokemonById[{keys:ids}][{keys:props}]', pathSet);
        return fetchPathsFromPokeapi(pathSet, 'pokemon')
          .then(r => {
            debugger;
            console.log(JSON.stringify(r));
            return r;
          });
      }
    },
    {
      route: 'pokemonById[{keys:ids}].types[{keys:typeIndexes}]',
      get(pathSet) {
        console.log('pokemonById[{keys:ids}].types[{keys:typeIndexes}]', pathSet);
        return fetchPathsFromPokeapi(pathSet, 'pokemon')
          .then(results => {
            return results.map((result) => {
              return result.value.map((type, i) => {
                const id = parseId(type.resource_uri);
                return {
                  path: result.path.concat(i),
                  value: jsong.ref(['typeById', id])
                };
              });
            })
          })
          .then(flatten).then(r => {
            debugger;
            console.log(JSON.stringify(r));
            return r;
          });
      }
    },
    {
      route: 'pokemonById[{keys:ids}].sprite',
      get(pathSet) {
        console.log('pokemonById[{keys:ids}].sprite', pathSet);
        return fetchPathsFromPokeapi(pathSet, 'pokemon')
          .then(results => {
            return results.map((result) => {
              const id = result.path[1];
              return {
                path: result.path,
                value: jsong.ref(['spriteById', id])
              };
            })
          })
          .then(r => {
            debugger;
            console.log(JSON.stringify(r));
            return r;
          });
      }
    },
    {
      route: 'spriteById[{keys:ids}][{keys:props}]',
      get(pathSet) {
        console.log('spriteById[{keys:ids}][{keys:props}]', pathSet);
        return fetchPathsFromPokeapi(pathSet, 'sprite');
      }
    },
    {
      route: 'typeById[{keys:ids}][{keys:props}]',
      get(pathSet) {
        console.log('typeById', pathSet);
        return fetchPathsFromPokeapi(pathSet, 'type');
      }
    }
  ]);
}));

function fetchPathsFromPokeapi(pathSet, api) {
  const props = Array.isArray(pathSet[2]) ? pathSet[2] : [pathSet[2]];
  const pokemonPromises = pathSet.ids
    .map(id => {
      const pokemonValue = fetchPropsFromResource(props, `api/v1/${api}/${id}/`);
      return pokemonValue
        .then(pokemonValue => props
          .map(prop => ({path: [pathSet[0], id, prop], value: pokemonValue[prop]})));
    });

  return Promise.all(pokemonPromises).then(flatten);
}

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
  console.log('fetch', resource);
  return fetch(`${endpoint}${resource}`)
    .then(response => {
      if (!response.ok) {
        const errorMsg = `Exception during fetching ${response.url}: ${response.status} ${response.statusText}`;
        console.error(errorMsg);
        throw new Error(errorMsg)
      }
      return response.json();
    });
}

function flatten(array) {
  var flattened = Array.prototype.concat.apply([], array);
  console.log(flattened);
  return flattened;
}

// serve static files from current directory
app.use(express.static(__dirname + '/'));

console.log('Server listening on http://localhost:3000');
var server = app.listen(3000);
