function displayFortune(time, button) {

    if (button != null) {
        button.addClass('fa-spin');
    }
    $.getJSON("/api/v1/random?s=true&n=200", function(data) {

        categories = data['categories'].map((category) => {
            return category['name']
        });

        $("#fortunes-animation").animate({opacity:0}, time)
            .queue(function(){
                $(this).find(".fortune").text(data['text']);
                $(this).find(".category").text(categories.join(", "));
                $(this).dequeue();
                if (button != null) {
                    button.removeClass('fa-spin')
                }
            })
            .animate({opacity:1}, time);
    }).fail(function (err) {
        console.log(err.responseText)
    });
}
var intervalId;

function startTimer() {
      intervalId = setInterval(function() {
        displayFortune(200, null);
    }, 30 * 1000);
}

$(document).ready(function() {

    $("#menu-toggle").click(function() {
        $("#header nav").slideToggle();
    });

    $("#refresh-fortune").click(function() {
      clearInterval(intervalId);
      displayFortune(200, $(this));
      startTimer();
    });

    displayFortune(0, null);
    startTimer();
});
