
$(function() {
  $(".navbar-burger").click(function() {
    $($(this).data('target')).slideToggle()
  });
});
