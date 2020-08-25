$(() => {
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
});
