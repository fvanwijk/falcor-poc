const model = new falcor.Model({
  source: new falcor.HttpDataSource('/model.json')
});

model
  .get('greeting[0..10].name')
  .then((result) => {
    const tiles = Object.keys(result.json.greeting)
      .map(key => result.json.greeting[key])
      .map(pokemon => ({
        title: pokemon.name,
        src: 'https://zemanifesto.files.wordpress.com/2014/07/bravecor1.jpg'
      }));
    renderTiles(tiles)
  });

function renderTiles(tiles) {
  const contentDiv = document.querySelector('#content');
  contentDiv.innerHTML = tiles
    .map(tile => tileToHtml(tile)).join('');
}

function tileToHtml(tile) {
  return `
  <div class="col-sm-3">
    <div class="card">
      <div class="card-block">
        <h4 class="card-title">${tile.title}</h4>
        <h6 class="card-subtitle text-muted">Water</h6>
      </div>
      <img class="card-img-buttom" src="${tile.src}" alt="${tile.title}" width="100%">
      <div class="card-block">
        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        <a href="#" class="btn btn-primary">Details &raquo;</a>
      </div>
    </div>
  </div>
  `;
}
