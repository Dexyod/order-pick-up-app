$(() => {
  const menuItems = {};
  const createMenuItem = (item) => {
    return (`
    <div class="card card-body d-flex align-items-center">
    <h6>${item.name}</h6>
    <span class="font-weight-bold">$${(item.price / 100).toFixed(2)}</span>
    <img src="${item.photo_url}" alt=""
      class="img-thumbnail card-img-top">
    <p class="small item-description">
      ${item.description}
    </p>
    <div>
    <button type="button" class="btn btn-outline-dark mr-3" id="add-to-cart-button" name="${item.id}">
      Add To Cart
    </button>
    </div>
    </div>
    `);
  };

  const createCartItem = (item) => {
    return (`
    <tr>
      <td class="w-25">
        <img src="${item.photo_url}"
          class="cart-image" alt="Sheep">
      </td>
      <td style="padding-top: 60px;">${item.name}</td>
      <td style="padding-top: 60px;">$${(item.price / 100).toFixed(2)}</td>
      <td style="padding-top: 54px;  width: 69px;" class="qty table-padding"><input type="text" class="form-control"
          id="cart-quantity" name="${item.id}" value="${item.quantity}"></td>
      <td style="padding-top: 60px;">$${(item.price * item.quantity / 100).toFixed(2)}</td>
      <td style="padding-top: 47px;">
        <a href="#" id="remove-item-button" name="${item.id}" class="btn btn-danger btn-sm">
          <i class="fa fa-times"></i>
        </a>
      </td>
    </tr>
    `);
  };

  $('#cartItems').on('click', '#remove-item-button', function (event) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    delete cart[this.name];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartNumber();
    updateCartItems();
  });

  $('#cartItems').on('input', '#cart-quantity', function (event) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart[this.name].quantity = this.value;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartNumber();
    updateCartItems();
    let newVal = $(`#cart-quantity[name="${this.name}"]`).val();
    $(`#cart-quantity[name="${this.name}"]`).focus().val("").val(newVal);
  });

  $('#menu-container').on('click', '#add-to-cart-button', function (event) {
    let cart = {};
    if (localStorage.getItem('cart')) {
      cart = JSON.parse(localStorage.getItem('cart'));
    }
    if (cart[this.name]) {
      cart[this.name].quantity++;
    } else {
      cart[this.name] = menuItems[this.name];
      cart[this.name].quantity = 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartNumber();
    updateCartItems();
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
      response.forEach((item) => {
        menuItems[item.id] = item;
        $('#menu-container').prepend(createMenuItem(item));
      });
    });
  const updateCartNumber = () => {
    if (localStorage.getItem('cart')) {
      $("#cart-number").html(Object.keys(JSON.parse(localStorage.getItem('cart'))).length);
    }
  };
  const updateCartItems = () => {
    let subTotal = 0;
    $("#cartItems").empty();
    if (!localStorage.getItem('cart')) {
      $("#cartItems").html("<p>Cart is empty!</p>");
    } else {
      const cart = JSON.parse(localStorage.getItem('cart'));
      for (const key in cart) {
        $("#cartItems").append(createCartItem(cart[key]));
        subTotal += (cart[key].price * cart[key].quantity / 100);
      }
      $("#cart-subtotal").html(`$${subTotal.toFixed(2)}`);
      let taxes = (subTotal * 0.13);
      $("#cart-taxes").html(`$${taxes.toFixed(2)}`);
      $("#cart-total").html(`$${(subTotal + taxes).toFixed(2)}`);
    }
  };
  updateCartNumber();
  updateCartItems();
});
