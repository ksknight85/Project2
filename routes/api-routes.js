// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;


module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error


  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    
    res.json("/members");
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    db.User.create({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }).then(function () {
      res.redirect(307, "/api/login");
    }).catch(function (err) {
      res.json(err);
      // res.status(422).json(err.errors[0].message);
    });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    }
    else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        wins: req.user.wins
      });
    }
  });

  app.get("api/gifs", function (req, res) {

    return res.json(db.gifs)
  })

  app.post("/api/gifs", function (req, res) {
    db.Gif.create({
      url: req.body.url,
      wins: 0,
      UserId: req.body.id
    }).then(function () {
      res.status(200).end();
    })
  });

  // Route for pulling gif url data from gif table
  app.get("/api/CHANGEME", function (req, res) {
    db.Gif.findAll().then(function (gifs) {
      var chosenGifs = []
      
      if (gifs.length < 4){
        return res.status(500).end();
      }

      var currentIndex = gifs.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = gifs[currentIndex];
        gifs[currentIndex] = gifs[randomIndex];
        gifs[randomIndex] = temporaryValue;
      }

    
      var chosenObjects = [...gifs.slice(0,4)]

      chosenGifs = chosenObjects.map(function(obj){
        return obj.dataValues.url
      })

      return res.json(chosenObjects)

    })

  })

  
  app.get("/api/winners", function (req, res) {
    db.Gif.findAll({
      order: [
        ["wins", "DESC"]
      ]
    }).then(function (gifs) {
      return res.json(gifs)
    })
  })

  app.post("/api/fav", function (req, res) {
    db.Favorite.create({
      url: req.body.url,
      UserId: parseInt(req.body.userId)
    }).then(function () {
      res.status(200).end();
    })
  });

  app.get("/api/fav", function (req, res) {
    db.Favorite.findAll().then(function (favs){
      return res.json(favs)
    })
  });

  app.get("/api/wins", function (req, res) {
    db.Gif.findAll().then(function (gifs) {
      return res.json(gifs)
    })
  })

  app.delete("/api/delete", function(req, res) {
    db.Favorite.destroy({
      where: {
        UserId: req.body.UserId,
        url: req.body.url
      }
    }).then(function(deleted) {
        return res.json(deleted);
      });
  });

  app.delete("/api/wins", function(req, res) {
    db.Gif.destroy({
      where: {
        UserId: req.body.UserId,
        url: req.body.url
      }
    }).then(function(deleted) {
        return res.json(deleted);
      });
  });

  app.post("/api/winningGif/:id", function(req, res) {
    db.User.increment("wins",{
      where: {
        id: req.params.id
      }
    }).then (function() {
      res.status(200).end();
    });
    db.Gif.increment("wins",{
      where: {
        UserId: req.params.id,
        url: req.body.url
      }
    }).then (function() {
      res.status(200).end();
    });
  });
}
