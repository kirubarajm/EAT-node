'use strict';

var Cusine = require('../../model/common/cusineModel');

exports.list_all_Cusine = function(req, res) {
    Cusine.getAllcusine(function(err, faq) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', faq);
    res.send(faq);
  });
};


exports.getRegionByType = function(req, res) {
    Cusine.getRegionByType(req.params.id, function(err, faq) {
    if (err)
      res.send(err);
    res.json(faq);
  });
};



exports.create_a_Region = function(req, res) {
  var new_ques = new Cusine(req.body);
  console.log(new_ques);
  //handles null error 
  
  Cusine.createquestions(new_ques, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
  
};


exports.read_a_question = function(req, res) {

    Cusine.read_a_question_id(req.body, function(err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};


exports.update_a_Region = function(req, res) {
    Cusine.updateById(req.params.id, new Faq(req.body), function(err, faq) {
    if (err)
      res.send(err);
    res.json(faq);
  });
};


exports.delete_a_Region = function(req, res) {
    Cusine.remove( req.params.id, function(err, faq) {
    if (err)
      res.send(err);
    res.json({ message: 'Faq successfully deleted' });
  });
};

