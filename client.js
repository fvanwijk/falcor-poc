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
  contentDiv.innerHTML = '';
  tiles
    .map(tile => tileToHtml(tile))
    .forEach(tileHtml => contentDiv.insertAdjacentHTML('afterend', tileHtml))
}

function tileToHtml(tile) {
  return `<h2>${tile.title}</h2><img src="${tile.src} alt=${tile.title}"/>`;
}
