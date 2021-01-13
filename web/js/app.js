
$(function() {
  $("#header .navbar-toggler").click(function() {
    $($(this).data('target')).slideToggle()
  });
});
