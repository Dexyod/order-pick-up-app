$(() => {
  const menuItems = {};
  const createMenuItem = (item) => {
    return (`
    <div class="card card-body">
    <span class="float-right font-weight-bold">$${(item.price / 100).toFixed(2)}</span>
    <h6 class="text-truncate">${item.name}</h6>
    <img src="${item.photo_url}" alt=""
      class="img-thumbnail">
    <p class="small item-description">
      ${item.description}
    </p>
    <div>
    <button type="button" class="btn btn-outline-dark mr-3 float-right" id="add-to-cart-button" name="${item.id}">
      Add To Cart
    </button>
    </div>
    </div>
    `);
  };

  $('#menu-container').on('click', '#add-to-cart-button', function (event) {
    let cart = {};
    if(localStorage.getItem('cart')) {
      cart = JSON.parse(localStorage.getItem('cart'))
    }
    if (cart[this.name]) {
      cart[this.name].quantity++;
    } else {
      cart[this.name] = menuItems[this.name];
      cart[this.name].quantity = 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log(JSON.parse(localStorage.getItem('cart')));
  });

  $('#register-form').submit(function (event) {
    event.preventDefault();
    const formData = $(this).serialize();
    $.ajax('/api/users/register', {
        method: 'POST',
        data: formData
      })
      .then(function (response) {
        console.log(response);
        $('#ModalRegister').modal('toggle');
        $("#login-options").load(location.href + " #login-options");
        $('#register-form').each(function () {
          this.reset();
        });
      });
  });
  $('#login-form').submit(function (event) {
    event.preventDefault();
    const formData = $(this).serialize();
    $.ajax('/api/users/login', {
        method: 'POST',
        data: formData
      })
      .then(function (response) {
        console.log(response);
        $('#ModalLogin').modal('toggle');
        $("#login-options").load(location.href + " #login-options");
        $('#login-form').each(function () {
          this.reset();
        });
      });
  });
  $('#login-options').on('click', '#logout', function (event) {
    event.preventDefault();
    $.ajax('/api/users/logout', {
        method: 'POST'
      })
      .then(function (response) {
        console.log(response);
        $("#login-options").load(location.href + " #login-options");
      });
  });
  $.ajax('/api/items/', {
      method: 'GET'
    })
    .then(function (response) {
      response.forEach((item) =>  {
        menuItems[item.id] = item;
        $('#menu-container').prepend(createMenuItem(item));
      });
      console.log(menuItems);
    })

});
