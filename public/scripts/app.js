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
    });
  });
  $('#logout').click(function (event) {
    event.preventDefault();
    $.ajax('/api/users/logout', {
      method: 'POST'
    })
    .then(function (response) {
      console.log(response);
    });
  });
});
