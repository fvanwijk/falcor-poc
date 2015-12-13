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

app.use('/model.json', falcorExpress.dataSourceRoute(() => {
  return new Router([
    byIdRoute('pokedex'),
    arrayPropertyRoute('pokedex', 'pokemon', 'pokemon'),
    byIdRoute('pokemon'),
    arrayPropertyRoute('pokemon', 'types', 'type'),
    arrayPropertyRoute('pokemon', 'sprites', 'sprite'),
    byIdRoute('sprite'),
    byIdRoute('type')
  ]);
}));

function byIdRoute(resource) {
  return {
    route: `${resource}ById[{keys:ids}][{keys:props}]`,
    get(pathSet) {
      console.log(`${resource}ById[{keys:ids}][{keys:props}]`, pathSet);
      return fetchPathsFromPokeapi(pathSet, resource);
    }
  };
}

function arrayPropertyRoute(resource, property, arrayResource) {
  return {
    route: `${resource}ById[{keys:ids}].${property}[{keys:arrayIndexes}]`,
    get(pathSet) {
      console.log(`${resource}ById[{keys:ids}].${property}[{keys:arrayIndexes}]`, pathSet);
      return fetchPathsFromPokeapi(pathSet, resource)
        .then(results => {
          return results.map((result) => {
            return result.value
              .filter((_, i) => i in pathSet.arrayIndexes)
              .map((element, i) => {
                const id = parseId(element.resource_uri);
                return {
                  path: result.path.concat(i),
                  value: jsong.ref([`${arrayResource}ById`, id])
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
  };
}

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
  const flattened = Array.prototype.concat.apply([], array);
  console.log(flattened);
  return flattened;
}

// serve static files from current directory
app.use(express.static(__dirname + '/'));

console.log('Server listening on http://localhost:3000');
app.listen(3000);
