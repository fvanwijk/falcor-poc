'use strict';
// index.js
const falcorExpress = require('falcor-express');
const jsong = require('falcor-json-graph');
const Router = require('falcor-router');
const fetch = require('node-fetch');
const express = require('express');
const cacheManager = require('cache-manager');


const app = express();

function parseId(resource) {
  return /(\d+)\/$/.exec(resource)[1];
}

app.use('/model.json', falcorExpress.dataSourceRoute(() => {
  return new Router(flatten([
    idRouteWithPropertyRoutes('pokedex', {pokemon: 'pokemon'}),
    idRouteWithPropertyRoutes('pokemon', {
      types: 'type',
      sprites: 'sprite',
      abilities: 'ability',
      egg_groups: 'egg',
      move: 'move',
      descriptions: 'description'
    }),
    idRouteWithPropertyRoutes('sprite'),
    idRouteWithPropertyRoutes('type', {
      ineffective: 'type',
      no_effect: 'type',
      resistance: 'type',
      super_effective: 'type',
      weakness: 'type'
    }),
    idRouteWithPropertyRoutes('ability'),
    idRouteWithPropertyRoutes('egg'),
    idRouteWithPropertyRoutes('description'),
    idRouteWithPropertyRoutes('move')
  ]));
}));

function idRouteWithPropertyRoutes(resource, referenceArrayProperties) {
  const arrayPropertyRoutes = referenceArrayProperties ?
    Object.keys(referenceArrayProperties).map(key => {
      return referenceArrayPropertyRoute(resource, key, referenceArrayProperties[key])
    }) : [];
  return flatten([byIdRoute(resource), arrayPropertyRoutes]);
}

function byIdRoute(resource) {
  return {
    route: `${resource}ById[{keys:ids}][{keys:props}]`,
    get(pathSet) {
      //console.log(`${resource}ById[{keys:ids}][{keys:props}]`, pathSet);
      return fetchPathsFromPokeapi(pathSet, resource);
    }
  };
}

function referenceArrayPropertyRoute(resource, property, arrayResource) {
  return {
    route: `${resource}ById[{keys:ids}].${property}[{keys:arrayIndexes}]`,
    get(pathSet) {
      //console.log(`${resource}ById[{keys:ids}].${property}[{keys:arrayIndexes}]`, pathSet);
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
        .then(flatten);
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
  return fetchPokeApiCached(resource)
    .then(response => {
        const result = {};
        props.map(prop => {
          return result[prop] = response[prop]
        });
        return result;
      }
    );
}

const memoryCache = cacheManager.caching({store: 'memory', max: 100, ttl: 10/*seconds*/});
function fetchPokeApiCached(resource) {
  return new Promise((resolve, reject) => {
    function work(cb) {
      fetchPokeApi(resource)
        .then(_ => cb(null, _))
        .catch(cb)
    }

    function onResult(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    }

    memoryCache.wrap(resource, work, onResult);
  });
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
  return Array.prototype.concat.apply([], array);
}

// serve static files from current directory
app.use(express.static(__dirname + '/'));

console.log('Server listening on http://localhost:3000');
app.listen(3000);
