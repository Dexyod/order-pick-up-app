$(() => {
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
    </div>
    `);
  };

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
      $( '#register-form' ).each(function(){
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
      $( '#login-form' ).each(function(){
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
    response.forEach(item => $('#menu-container').prepend(createMenuItem(item)));
    console.log(response[0]);
  })

});
