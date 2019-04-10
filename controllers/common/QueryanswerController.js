'use strict';

var QueryAnswer = require('../../model/common/queryanswerModel');

exports.list_all_faq = function(req, res) {
  QueryAnswer.getAllFaq(function(err, faq) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', faq);
    res.send(faq);
  });
};


exports.list_all_faqbytype = function(req, res) {
  QueryAnswer.getFaqByType(req.params.id, function(err, faq) {
    if (err)
      res.send(err);
    res.json(faq);
  });
};



exports.create_a_answer = function(req, res) {
  var new_faq = new QueryAnswer(req.body);
  console.log(new_faq);
  //handles null error 
  
  QueryAnswer.createanswer(new_faq, function(err, faq) {
    if (err)
      res.send(err);
    res.json(faq);
  });
  
};


exports.read_a_replies = function(req, res) {
  QueryAnswer.read_a_replies_id(req.params.aid, function(err, faq) {
    if (err)
      res.send(err);
    res.json(faq);
  });
};


exports.update_read_answer = function(req, res) {
  QueryAnswer.update_read_answer(req.body, function(err, faq) {
    if (err)
      res.send(err);
    res.json(faq);
  });
};


exports.delete_a_faq = function(req, res) {
  QueryAnswer.remove( req.params.id, function(err, faq) {
    if (err)
      res.send(err);
    res.json({ message: 'Faq successfully deleted' });
  });
};

exports.read_a_answer_count = function(req, res) {
  console.log(req.body);
  QueryAnswer.read_a_answer_count(req.body, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};