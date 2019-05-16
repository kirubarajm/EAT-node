"use strict";

var QueryQuestions = require("../../model/common/queryquestionsModel");

exports.list_all_faq = function(req, res) {
  QueryQuestions.getAllFaq(function(err, faq) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};

exports.list_all_faqbytype = function(req, res) {
  QueryQuestions.getFaqByType(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.create_a_question = function(req, res) {
  var new_ques = new QueryQuestions(req.body);
  console.log(new_ques);
  //handles null error

  QueryQuestions.createquestions(new_ques, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_question = function(req, res) {
  QueryQuestions.read_a_question_id(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.update_a_faq = function(req, res) {
  QueryQuestions.updateById(req.params.id, new Faq(req.body), function(
    err,
    faq
  ) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.delete_a_faq = function(req, res) {
  QueryQuestions.remove(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json({ message: "Faq successfully deleted" });
  });
};
