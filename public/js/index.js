var userData
var gold
var silver
var bronze
var winnersArray = []

$(document).ready(function () {
    // This file just does a GET request to figure out which user is logged in
    // and updates the HTML on the page
    game()

    $.get("/api/user_data").then(function(data) {

        userData = data.id
        if (userData) {
            $("#catSearch").html(`<div class="navbar-nav"><a class="nav-item nav-link" href="./gifs.html">Pick a Cat<span class="sr-only"></span></a></div>`)
            $("#user-name").text(" " + data.firstName)
            $("#goProfile").html(`<div class="navbar-nav"><a class="nav-item nav-link active" href="./members.html">Go to Profile<span class="sr-only"></span></a></div>`)
            $("#logoutButton").html(`<div class="navbar-nav"><a class="nav-item nav-link active" id="logout" href="/logout">Logout<span class="sr-only"></span></a></div>`)
        } else {
           $("#user-name").text(" Player!") 
           $("#signuplogin").html(` <h2 id="code">Wanna add your own cat to the tournament? <i class="em em-heart_eyes_cat"></i></h2><a href="/login"><button class="pulse">Sign-In</button></a><h3>or</h3><a href="/signup"><button class="raise">Sign-Up</button></a>`)
        }
    });
    $.get("/api/winners").then(function (data) {
        for (var i = 0; i < 3; i++) {
            var short = data[i]
            winnersArray.push(short.url)

        }
        gold = winnersArray[0];
        silver = winnersArray[1];
        bronze = winnersArray[2]
       

        $(".gold").append("<img class='medals' src=" + gold + ">")
        $(".silver").append(("<img class='medals' src=" + silver + ">"))
        $(".bronze").append("<img class='medals' id='bronzeMedal' src=" + bronze + ">")
    })
});


var colors = new Array(
    [62, 35, 255],
    [60, 255, 60],
    [255, 35, 98],
    [45, 175, 230],
    [255, 0, 255],
    [255, 128, 0]);

var step = 0;
//color table indices for: 
// current color left
// next color left
// current color right
// next color right
var colorIndices = [0, 1, 2, 3];

//transition speed
var gradientSpeed = 0.002;

function updateGradient() {

    if ($ === undefined) return;

    var c0_0 = colors[colorIndices[0]];
    var c0_1 = colors[colorIndices[1]];
    var c1_0 = colors[colorIndices[2]];
    var c1_1 = colors[colorIndices[3]];

    var istep = 1 - step;
    var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
    var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
    var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
    var color1 = "rgb(" + r1 + "," + g1 + "," + b1 + ")";

    var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
    var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
    var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
    var color2 = "rgb(" + r2 + "," + g2 + "," + b2 + ")";

    $('.gradient').css({
        background: "-webkit-gradient(linear, left top, right top, from(" + color1 + "), to(" + color2 + "))"
    }).css({
        background: "-moz-linear-gradient(left, " + color1 + " 0%, " + color2 + " 100%)"
    });

    step += gradientSpeed;
    if (step >= 1) {
        step %= 1;
        colorIndices[0] = colorIndices[1];
        colorIndices[2] = colorIndices[3];

        //pick two new target color indices
        //do not pick the same as the current one
        colorIndices[1] = (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;
        colorIndices[3] = (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;

    }
}

setInterval(updateGradient, 10);

// GAME FUNCTIONALITY
$(".gif").on("click", function (event) {
    if (        
        ($(this).attr("src") === "https://requestreduce.org/images/cat-book-clipart-pusheen.png") ||
        ($(this).attr("src") === "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMyXdx7Y_b8xZ1IPPvykLCe-rY7VP1pq1ytIti2jQWZWzkx2JYIw") ||
        ($(this).attr("src") === "https://appstickers-cdn.appadvice.com/1447881598/829772634/e3abc46a590c6f8616e61ca75a2b24d6-1.png") ||
        ($(this).attr("src") === "http://images6.fanpop.com/image/photos/41200000/-l-p-pusheen-the-cat-41293287-500-336.png")
        ) {
        return
    }
    else if ((this.id === "gif1") || (this.id === "gif2")) {
            var dataID = $(this).data("id");
        $("#winOf12").attr("src", this.src);
        $("#winOf12").attr("data-ownerId", dataID);
    }
    else if ((this.id === "gif3") || (this.id === "gif4")) {
        var dataID = $(this).data("id");
        $("#winOf34").attr("src", this.src)
        $("#winOf34").attr("data-ownerId", dataID);

    }
    else if ((this.id === "winOf12") || (this.id === "winOf34")) {
        if ($("#winOf12").attr("src") === undefined || $("#winOf34").attr("src") === undefined) {
            return
        }
        else {
            var ownerId = $(this).attr("data-ownerId");
            $("#winner").attr("src", this.src);
            $("#winner").attr("data-ownerId", ownerId);
            var winner = [$("#winner").attr("data-ownerId"), $("#winner").attr("src")];
            $.post("/api/winningGif/" + winner[0], {
                url: winner[1],
            }, function(data) {

            });
            if (userData) {
                $(".modal-footer").html(`<button type="button" id="addFav" class="raise" data-dismiss="modal">Add to Favorites</button>`)
                $("#addFav").attr("data-url", this.src)
                //    gifButton.attr("data-url", animateURL)
            }
            $("#winner-gif").attr("src", this.src).css("width", "100%");
            // Show the modal with the best match
            $("#results-modal").modal("toggle");
            reset();
        }
    }
});

$("#results-modal").on("click", "#addFav", function (){
    var url = $(this).attr("data-url")
    $.post("/api/fav", {
        url: url,
        userId: userData
    },function(data) {
    })
})

var urlGif1
var urlGif2
var urlGif3
var urlGif4

function game() {
    $.get("/api/CHANGEME", function (data) {

        urlGif1 = data[0].url
        urlGif2 = data[1].url
        urlGif3 = data[2].url
        urlGif4 = data[3].url

        userIDGif1 = data[0].UserId
        userIDGif2 = data[1].UserId
        userIDGif3 = data[2].UserId
        userIDGif4 = data[3].UserId
    })
}
function populateImages() {
    $("#gif1").attr("src", urlGif1);
    $("#gif2").attr("src", urlGif2);
    $("#gif3").attr("src", urlGif3);
    $("#gif4").attr("src", urlGif4);
    $("#gif1").attr("data-id", userIDGif1);
    $("#gif2").attr("data-id", userIDGif2);
    $("#gif3").attr("data-id", userIDGif3);
    $("#gif4").attr("data-id", userIDGif4);
}

$("#play").on("click", function (event) {
    $("#winOf12").attr("src", "");
    $("#winOf34").attr("src", "");
    $("#winner").attr("src", "");
    populateImages()

})

function reset() {
    $("#gif1").attr("src", "https://requestreduce.org/images/cat-book-clipart-pusheen.png");
    $("#gif2").attr("src", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMyXdx7Y_b8xZ1IPPvykLCe-rY7VP1pq1ytIti2jQWZWzkx2JYIw");
    $("#gif3").attr("src", "https://appstickers-cdn.appadvice.com/1447881598/829772634/e3abc46a590c6f8616e61ca75a2b24d6-1.png");
    $("#gif4").attr("src", "http://images6.fanpop.com/image/photos/41200000/-l-p-pusheen-the-cat-41293287-500-336.png");

    $("#winOf12").attr("src", "");
    $("#winOf34").attr("src", "");
    $("#winner").attr("src", "");
}
$("#reset").on("click", function (event) {
    game();
    reset();
})


$("#logout").on("click", function(){
    $.get("/logout").then(function(data) {
    });
})

var x = document.getElementById("myAudio"); 

function playAudio() { 
  x.play(); 
} 
