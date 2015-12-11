const model = new falcor.Model({
  source: new falcor.HttpDataSource('/model.json')});

//model.get('pokemon["name", "species"]').then(pokemon   => console.log(pokemon));

model
  .get('pokemon[0..10].["name", "species", "image"]')
  .then((result) => {
    const pokemonObject = result.json.pokemon;
    const pokemonArray = Object.keys(pokemonObject)
      .map(key => pokemonObject[key]);
    console.log(pokemonArray);
    renderTiles(pokemonArray)
  });

function renderTiles(tiles) {
  const contentDiv = document.querySelector('#content');
  contentDiv.innerHTML = tiles
    .map(tile => tileToHtml(tile)).join('');
}

function tileToHtml(tile) {
  tile.src = 'https://zemanifesto.files.wordpress.com/2014/07/bravecor1.jpg'; // temp
  return `
  <div class="col-sm-3">
    <div class="card">
      <div class="card-block">
        <h4 class="card-title">${tile.name}</h4>
        <h6 class="card-subtitle text-muted">Water</h6>
      </div>
      <img class="card-img-buttom" src="http://pokeapi.co/${tile.image}" alt="${tile.name}" width="100%">
      <div class="card-block">
        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        <a href="#" class="btn btn-primary">Details &raquo;</a>
      </div>
    </div>
  </div>
  `;
}
