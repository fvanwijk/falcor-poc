const model = new falcor.Model({
  source: new falcor.HttpDataSource('/model.json')});

const typeColors = {
  Normal: '#9C9C63',
  Fighting: '#AE2A24',
  Flying: '#8E6FEB',
  Poison: '#923A92',
  Ground: '#DBB54D',
  Rock: '#A48F32',
  Bug: '#97A51D',
  Ghost: '#644E88',
  Steel: '#A0A0C0',
  Fire: '#ED6D12',
  Water: '#4578ED',
  Grass: '#69C23D',
  Electric: '#F6C913',
  Ice: '#7ECECE',
  Dragon: '#5E1DF7',
  Dark: '#644E40',
  Fairy: '#E87890',
  Unknown: '',
  Shadow: '',
  Psychic: '#F73670'
};

//model.get('pokemon["name", "species"]').then(pokemon   => console.log(pokemon));

//model.get('type[1]').then(function (result) {
//  console.log(result.json)
//  return result.json;
//});

model
  .get('pokedex[0..10]["name", "attack", "national_id", "defense", "hp", "image", "sprite"].image')
  .then((result) => {
    const pokemonObject = result.json.pokedex;
    const pokemonArray = Object.keys(pokemonObject)
      .map(key => pokemonObject[key]);
    renderTiles(pokemonArray)
  });

function renderTiles(tiles) {
  const contentDiv = document.querySelector('#content');
  contentDiv.innerHTML = tiles
    .map(tile => tileToHtml(tile)).join('');
}

function showBadges(types) {
  return types.map(function (type) {
    return `<span class="label" style="background-color: ${typeColors[type]}">${type}</span>`;
  }).join(' ');
}

function tileToHtml(tile) {
  // temp
  tile.src = 'https://zemanifesto.files.wordpress.com/2014/07/bravecor1.jpg';
  tile.types = ['Water', 'Fire', 'Normal', 'Fighting'];

  return `
  <div class="col-sm-3">
    <div class="card text-sm-center">
      <div class="card-header">${tile.name}</div>
      <div class="card-block">${showBadges(tile.types)}</div>
      <img class="card-img-buttom" src="http://pokeapi.co/${tile.sprite.image}" alt="${tile.name}" max-width="100%">
      <div class="card-block">
        <ul class="list-unstyled card-text">
        <li>HP: ${tile.hp}</li>
        <li>Attack: ${tile.attack}</li>
        <li>Defense: ${tile.defense}</li>
        </ul>
        <a href="#" class="btn btn-primary">Details &raquo;</a>
      </div>
    </div>
  </div>
  `;
}
