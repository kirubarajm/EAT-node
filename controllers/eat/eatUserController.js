'use strict';

var Eatuser = require('../../model/eat/eatUserModel.js');

exports.list_all_eatuser = function(req, res) {
  Eatuser.getAllUser(function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.create_a_eatuser = function(req, res) {
  var new_user = new Eatuser(req.body);
  //handles null error 
   if(!new_user.name || !new_user.phoneno){

            res.status(400).send({ error:true, message: 'Please provide name/phoneno' });

    }
  else{
  Eatuser.createUser(new_user, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};


exports.read_a_user = function(req, res) {
  Eatuser.getUserById(req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.update_a_user = function(req, res) {
 Eatuser.updateById(req.params.userid, new Eatuser(req.body), function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.delete_a_user = function(req, res) {
 Eatuser.remove( req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json({ message: 'Eatuser successfully deleted' });
  });
};

exports.list_all_virtual_eatuser = function(req, res) {
  Eatuser.getAllVirtualUser(req.body,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.virtual_eatusersearch = function(req, res) {
 // console.log(req.params.phoneno);
  Eatuser.virtual_eatusersearch(req.params.phoneno,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};