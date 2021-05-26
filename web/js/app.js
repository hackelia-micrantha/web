
$(function() {
  $(".navbar-burger").click(function() {
    $($(this).data('target')).slideToggle()
  });
});

$.get("https://fortunes.micrantha.com/api/v1/random?s=true", function (data) {
  $("#fortune").html( "&#10077; " + data.text + " &#10078;" )
});
