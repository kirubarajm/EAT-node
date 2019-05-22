"use strict";

var Region = require("../../model/common/regionModel");

exports.list_all_region = function(req, res) {
  Region.getAllregion(function(err, faq) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};

exports.getRegionByType = function(req, res) {
  Region.getRegionByType(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.create_a_Region = function(req, res) {
  var new_ques = new Region(req.body);
  console.log(new_ques);
  //handles null error

  Region.createquestions(new_ques, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_question = function(req, res) {
  Region.read_a_question_id(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.update_a_Region = function(req, res) {
  Region.updateById(req.params.id, new Faq(req.body), function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.delete_a_Region = function(req, res) {
  Region.remove(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json({ message: "Faq successfully deleted" });
  });
};

exports.pro_call = function(req, res) {
  Region.procall(req, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};
