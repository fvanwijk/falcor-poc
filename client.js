var model = new falcor.Model({
  source: new falcor.HttpDataSource('/model.json')
});

model
  .getValue('greeting')
  .then(function(name) {
    renderTiles([
      {
        title: name,
        src: 'https://zemanifesto.files.wordpress.com/2014/07/bravecor1.jpg?w=50&h=50'
      }
    ])
  });

renderTiles([{
  title: 'falcor',
  src: 'https://zemanifesto.files.wordpress.com/2014/07/bravecor1.jpg?w=590&h=442'
}]);

function renderTiles(tiles) {
  const contentDiv = document.querySelector('#content');
  contentDiv.innerHTML = '';
  tiles
    .map(tile => tileToHtml(tile))
    .forEach(tileHtml => contentDiv.insertAdjacentHTML('afterend', tileHtml))
}

function tileToHtml(tile) {
  return `<h2>${tile.title}</h2><img src="${tile.src} alt=${tile.title}"/>`;
}
