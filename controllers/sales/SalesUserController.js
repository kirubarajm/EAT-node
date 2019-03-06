'use strict';

var Salesuser = require('../../model/sales/salesUserModel.js');

exports.list_all_user = function(req, res) {
  Salesuser.getAllUser(function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.create_a_user = function(req, res) {
  var new_user = new Salesuser(req.body);
  //handles null error 
   if(!new_user.name || !new_user.phoneno){

            res.status(400).send({ error:true, message: 'Please provide name/phoneno' });

    }
  else{
  Salesuser.createUser(new_user, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};


exports.read_a_user = function(req, res) {
  Salesuser.getUserById(req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.update_a_user = function(req, res) {
 Salesuser.updateById(req.params.userid, new Salesuser(req.body), function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.delete_a_user = function(req, res) {
 Salesuser.remove( req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json({ message: 'Salesuser successfully deleted' });
  });
};

exports.checklogin = function(req, res) {
  var new_user = new Salesuser(req.body);
  Salesuser.checkLogin(new_user, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};