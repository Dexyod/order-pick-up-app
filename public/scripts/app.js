$(() => {
  const menuItems = {};

  // template for menu items

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

  // template for cart items

  const createCartItem = (item) => {
    return (`
    <tr>
      <td class="w-25">
        <img src="${item.photo_url}"
          class="cart-image" alt="Sheep">
      </td>
      <td style="padding-top: 60px;">${item.name}</td>
      <td style="padding-top: 60px;">$${(item.price / 100).toFixed(2)}</td>
      <td style="padding-top: 25px;">
      <div><i class="fa fa-plus hover" id="increment-quantity" name="${item.id}"></i></div>
      <div style="margin: 10px 0">${item.quantity}</div>
      <div><i class="fa fa-minus hover" id="decrement-quantity" name="${item.id}"></i></div>
      </td>
      <td style="padding-top: 60px;">$${(item.price * item.quantity / 100).toFixed(2)}</td>
      <td style="padding-top: 47px;">
        <a href="#" id="remove-item-button" name="${item.id}" class="btn btn-danger btn-sm">
          <i class="fa fa-times"></i>
        </a>
      </td>
    </tr>
    `);
  };

  // handles all the checkout logic

  $('#cart-checkout').on('click', function(event) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    let formData = { items: [] };
    for (const key in cart) {
      cart[key].comment = "";
      formData.items.push(cart[key]);
    }
    formData.comment = $('#cart-comment').val();
    $.ajax('/api/items/checkout', {
      method: 'POST',
      data: formData
    })
      .then(function(response) {
        $('#ModalCart').modal('toggle');
        localStorage.removeItem("cart");
        updateCartNumber();
        updateCartItems();
        $('#cart-comment').val("");
      })
      .catch((err) => {
        console.log(err);
        validate('Please login to checkout!');
        $(".error").slideDown("slow");
        $(".error").addClass("show");
      });
  });

  // removes items from localStorage

  $('#cartItems').on('click', '#remove-item-button', function(event) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    delete cart[this.name];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartNumber();
    updateCartItems();
  });

  // handles the cart incrementors being clicked

  $('#cartItems').on('click', '#increment-quantity', function(event) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart[$(this).attr('name')].quantity <= 50) {
      cart[$(this).attr('name')].quantity++;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartNumber();
    updateCartItems();
  });

  $('#cartItems').on('click', '#decrement-quantity', function(event) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart[$(this).attr('name')].quantity > 1) {
      cart[$(this).attr('name')].quantity--;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartNumber();
    updateCartItems();
  });

  // adds items to the cart and updates everything

  $('#menu-container').on('click', '#add-to-cart-button', function(event) {
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

  $('#register-form').submit(function(event) {
    event.preventDefault();
    const formData = $(this).serialize();
    $.ajax('/api/users/register', {
      method: 'POST',
      data: formData
    })
      .then(function(response) {
        console.log(response);
        $('#ModalRegister').modal('toggle');
        $("#login-options").load(location.href + " #login-options");
        $('#register-form').each(function() {
          this.reset();
        });
      })
      .catch((err) => {
        console.log(err);
        validate('Error! E-mail in use!');
        $(".error").slideDown("slow");
        $(".error").addClass("show");
      });
  });

  // login logic

  $('#login-form').submit(function(event) {
    event.preventDefault();
    const formData = $(this).serialize();
    $.ajax('/api/users/login', {
      method: 'POST',
      data: formData
    })
      .then(function(response) {
        console.log(response);
        $('#ModalLogin').modal('toggle');
        $("#login-options").load(location.href + " #login-options");
        $('#login-form').each(function() {
          this.reset();
          getUserHistory();
        });
      })
      .catch((err) => {
        console.log(err);
        validate('Error! Incorrect e-mail/password!');
        $(".error").slideDown("slow");
        $(".error").addClass("show");
      });
  });

  // logout logic

  $('#login-options').on('click', '#logout', function(event) {
    event.preventDefault();
    $.ajax('/api/users/logout', {
      method: 'POST'
    })
      .then(function(response) {
        console.log(response);
        $("#login-options").load(location.href + " #login-options");
        $('#history-container').empty();
      })
      .catch((err) => console.log(err));
  });

  // initial fetch of all the menu items in the database

  $.ajax('/api/items/', {
    method: 'GET'
  })
    .then(function(response) {
      response.forEach((item) => {
        menuItems[item.id] = item;
        switch (item.category) {
        case 'Starter':
          $('#starter-container').prepend(createMenuItem(item));
          break;
        case 'Main':
          $('#main-container').prepend(createMenuItem(item));
          break;
        case 'Desert':
          $('#desert-container').prepend(createMenuItem(item));
          break;
        case 'Drink':
          $('#drink-container').prepend(createMenuItem(item));
          break;
        default:
          break;
        }
      });
    })
    .catch((err) => console.log(err));


  // Updates the number beside the cart in the UI

  const updateCartNumber = () => {
    if (localStorage.getItem('cart')) {
      const cart = JSON.parse(localStorage.getItem('cart'));
      let total = 0;
      for (const key in cart) {
        total += Number(cart[key].quantity);
      }
      $(".cart-number").html(total);
    } else {
      $(".cart-number").html("0");
    }
  };

  // refreshes the items in the cart to represent recent changes

  const updateCartItems = () => {
    let subTotal = 0;
    $("#cartItems").empty();
    if (!localStorage.getItem('cart')) {
      $("#cartItems").html("<p>Cart is empty!</p>");
      $("#cart-subtotal").html("$0");
      $("#cart-taxes").html("$0");
      $("#cart-total").html("$0");
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

  // template for history menu items

  const createHistoryMenuItem = (item) => {
    return (`
    <div class="card card-body d-flex align-items-center">
      <h6>${item.name}</h6>
      <span class="font-weight-bold">$${(item.price / 100).toFixed(2)}</span>
      <img src="${item.photo_url}" alt=""
        class="img-thumbnail card-img-top">
      <p class="small item-description">
        ${item.description}
      </p>
      <div>Ordered On: ${item.order_date}</div>
      <div>Quantity Ordered: ${item.quantity}</div>
      <div>
        <button type="button" class="btn btn-outline-dark mr-3" id="add-to-cart-button" name="${item.id}">Add To Cart
        </button>
      </div>
    </div>
    `);
  };

  // fetches the logged in users history

  const getUserHistory = () => {
    $.ajax('/api/items/user-history', {
      method: 'GET'
    })
      .then(function(response) {
        response.forEach((item) => {

          item.order_date = item.order_date.slice(0, 10);
          menuItems[item.id] = item;
          $('#history-container').append(createHistoryMenuItem(item));
        });
      })
      .catch((err) => console.log(err));
  };

  updateCartNumber();
  updateCartItems();
  getUserHistory();
});
