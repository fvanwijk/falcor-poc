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