$(document).ready(function () {
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $("#scroll-btn").addClass("show");
      $("#scroll-btn").fadeIn();
    } else {
      $("#scroll-btn").fadeOut();
    }
  });
  $("#scroll-btn").on("click", function (event) {
    event.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, 300, function () {
      $("#ModalCart").modal();
    });
  });
});
