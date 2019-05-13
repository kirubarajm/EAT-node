'use strict';

var EatuserAddress = require('../../model/eat/eatUserAddressModel.js');

exports.list_all_address = function(req, res) {
    EatuserAddress.getAllAddress(function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.create_a_address = function(req, res) {
  var new_address = new EatuserAddress(req.body);
  //handles null error 
   if(!new_address.lat || !new_address.lon){

            res.status(400).send({ error:true, message: 'Please provide lat/lon' });

    }
  else{
    EatuserAddress.createUserAddress(new_address, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};


exports.read_a_user_address_userid = function(req, res) {
    EatuserAddress.getaddressById(req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.read_a_user_address_aid = function(req, res) {
  EatuserAddress.getaddressByaid(req.params.aid, function(err, user) {
  if (err)
    res.send(err);
  res.json(user);
});
};

exports.update_a_user_address = function(req, res) {
    EatuserAddress.updateById(req.body, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.delete_a_user_address = function(req, res) {
    EatuserAddress.remove( req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json({ message: 'Eatuser successfully deleted' });
  });
};

exports.update_delete_status = function(req, res) {
  EatuserAddress.update_delete_status(req.body, function(err, user) {
  if (err)
    res.send(err);
  res.json(user);
});
};

exports.get_a_admin_address = function(req, res) {
  EatuserAddress.getaddressByadmin(req.params, function(err, user) {
  if (err)
    res.send(err);
  res.json(user);
});
};


exports.eat_user_default_address_update = function(req, res) {
  
  if(!req.body.aid){
    res.status(400).send({ error: true,status:false, message: 'Please provide password' });
  }else if(!req.body.userid){
    res.status(400).send({ error: true,status:false, message: 'Please provide userid' });
  }
  else{
    EatuserAddress.eat_user_default_address_update_aid(req.body, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};