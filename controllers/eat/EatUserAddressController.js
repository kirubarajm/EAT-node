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


exports.read_a_user_address = function(req, res) {
    EatuserAddress.getaddressById(req.params.userid, function(err, user) {
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