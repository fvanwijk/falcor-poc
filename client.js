const model = new falcor.Model({
  source: new falcor.HttpDataSource('/model.json')
});

model
  .getValue('greeting')
  .then((name) => {
    renderTiles([
      {
        title: name,
        src: 'https://zemanifesto.files.wordpress.com/2014/07/bravecor1.jpg?w=50&h=50'
      }
    ])
  });

function renderTiles(tiles) {
  const contentDiv = document.querySelector('#content');
  contentDiv.innerHTML = tiles
    .map(tile => tileToHtml(tile)).join('');
}

function tileToHtml(tile) {
  return `<h2>${tile.title}</h2><img src="${tile.src} alt=${tile.title}"/>`;
}
