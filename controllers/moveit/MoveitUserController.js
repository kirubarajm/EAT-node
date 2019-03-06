'use strict';

var Moveituser = require('../../model/moveit/moveitUserModel.js');

exports.list_all_user = function(req, res) {
  Moveituser.getAllUser(function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.create_a_user = function(req, res) {
  var new_user = new Moveituser(req.body);
  //handles null error 
   if(!new_user.name || !new_user.phoneno){

            res.status(400).send({ error:true, message: 'Please provide name/phoneno' });

    }
  else{
  Moveituser.createUser(new_user, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};


exports.read_a_user = function(req, res) {
  Moveituser.getUserById(req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.update_a_user = function(req, res) {
 Moveituser.updateById(req.params.userid, new Moveituser(req.body), function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.delete_a_user = function(req, res) {
 Moveituser.remove( req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json({ message: 'Moveituser successfully deleted' });
  });
};

exports.checklogin = function(req, res) {
  var new_user = new Moveituser(req.body);
  Moveituser.checkLogin(new_user, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};