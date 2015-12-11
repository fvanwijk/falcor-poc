var model = new falcor.Model({
  cache: {
    user: {
      name: "Frank",
      surname: "Underwood",
      address: "1600 Pennsylvania Avenue, Washington, DC"
    }
  }
});

model
  .getValue('user.surname')
  .then(function(surname) {
    console.log(surname);
  });

renderTiles([{
  title: 'falcor',
  src: 'https://zemanifesto.files.wordpress.com/2014/07/bravecor1.jpg?w=590&h=442'
}]);

function renderTiles(tiles) {
  const contentDiv = document.querySelector('#content');
  tiles
    .map(tile => tileToDom(tile))
    .forEach(domTile => contentDiv.appendChild(domTile))
}

function tileToDom(tile) {
  const img = document.createElement('img');
  img.src = tile.src;
  img.alt = tile.title;
  return img;
}
