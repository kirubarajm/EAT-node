"use strict";

var Stories = require("../../model/common/storyModel");

exports.list_all_Stories = function(req, res) {
    Stories.getAllStories(req.params,function(err, Stories) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", Stories);
    res.send(Stories);
  });
};

;

exports.create_a_Stories = function(req, res) {
  var new_Stories = new Stories(req.body);
  console.log(new_ques);
  //handles null error

  Stories.createStories(new_Stories, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_Stories = function(req, res) {
    Stories.read_a_Stories(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.update_a_Stories = function(req, res) {
    Stories.updateById(req.params.id, new Faq(req.body), function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.delete_a_Stories = function(req, res) {
    Stories.remove(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json({ message: "Faq successfully deleted" });
  });
};

