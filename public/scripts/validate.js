//validation helper function
const validate = (error) => {
  $(".error").text(error);
  if ($(".error").length) {
    $(".error").addClass("shake");
    setTimeout(() => {
      setTimeout(() => {
        $(".error").slideUp('slow');
      }, 0);
      $(".error").removeClass("shake");
      $(".error").removeClass("show");
    }, 1500);
  } else {
    $(".error").text(error);
  }
};
