"use strict";

var Salesuser = require("../../model/sales/salesUserModel.js");
var Makeitrating = require("../../model/makeit/makeitRatingModel.js");

exports.list_all_user = function(req, res) {
  Salesuser.getAllUser(function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.create_a_user = function(req, res) {
  var new_user = new Salesuser(req.body);
  //handles null error
  if (!new_user.name) {
    res.status(400).send({ error: true, message: "Please provide name " });
  } else if (!new_user.phoneno) {
    res.status(400).send({ error: true, message: "Please provide phoneno" });
  } else if (!new_user.password) {
    res.status(400).send({ error: true, message: "Please provide password" });
  } else {
    Salesuser.createUser(new_user, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.read_a_user = function(req, res) {
  Salesuser.getUserById(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.update_a_user = function(req, res) {
  Salesuser.updateById(req.params.userid, new Salesuser(req.body), function(
    err,
    user
  ) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.delete_a_user = function(req, res) {
  Salesuser.remove(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json({ message: "Salesuser successfully deleted" });
  });
};

exports.checklogin = function(req, res) {
  var new_user = new Salesuser(req.body);
  Salesuser.checkLogin(new_user, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.create_a_rating = function(req, res) {
  var new_rating = new Makeitrating(req.body);
  //handles null error
  if (
    !new_rating.makeit_userid ||
    !new_rating.rating ||
    !new_rating.sales_emp_id
  ) {
    res
      .status(400)
      .send({
        error: true,
        message: "Please provide makeit_userid/rating/sales_emp_id"
      });
  } else {
    Makeitrating.createRating(new_rating, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.salesSearch = function(req, res) {
  Salesuser.getAllsalesSearch(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.edit_a_user = function(req, res) {
  //handles null error
  if (!req.body.id) {
    res.status(400).send({ error: true, message: "Please provide sales id" });
  } else {
    Salesuser.edit_sales_users(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.add_a_pushid = function(req, res) {
  Salesuser.update_pushid(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};
