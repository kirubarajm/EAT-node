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
  if (!new_user.name ) {
    res.status(400).send({ error: true, message: 'Please provide name ' });
  }else if(!new_user.phoneno){
    res.status(400).send({ error: true, message: 'Please provide phoneno' });
  }else if(!new_user.password){
    res.status(400).send({ error: true, message: 'Please provide password' });
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
  Eatuser.virtual_eatusersearch(req.params.search,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.eat_dish_list = function(req, res) {
  Eatuser.get_eat_dish_list(req.body,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.eat_makeit_list = function(req, res) {
  Eatuser.get_eat_makeit_list(req.body,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.eat_makeit_product_list = function(req, res) {
  Eatuser.get_eat_makeit_product_list(req.body,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.eat_dish_sort = function(req, res) {
  Eatuser.get_eat_dish_list_sort(req.body,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
}


exports.eat_kitchen_sort = function(req, res) {
  Eatuser.get_eat_kitchen_list_sort(req.body,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
}


exports.eat_user_referral = function(req, res) {
  Eatuser.eat_user_referral_code(req.params,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
}


exports.eatuser_login = function(req, res) {
  var new_user = new Eatuser(req.body);
  //handles null error 
  if(!new_user.phoneno){
    res.status(400).send({ error: true, message: 'Please provide phoneno' });
  }
  else{
  Eatuser.eatuser_login(new_user, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};

exports.eatuser_otpverification = function(req, res) {
  
  //var new_user = new Eatuser(req.body);
  //handles null error 
  if(!req.body.oid){
    res.status(400).send({ error: true, message: 'Please provide oid' });
  }else if(!req.body.phoneno){
    res.status(400).send({ error: true, message: 'Please provide phone_number' });
  }
  else{
  Eatuser.eatuser_otpverification(req.body, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};



exports.edit_eat_users = function(req, res) {
  
  if(!req.body.name){
    res.status(400).send({ error: true, message: 'Please provide name' });
  }else if(!req.body.gender){
    res.status(400).send({ error: true, message: 'Please provide phone_number' });
  }
  else{
  Eatuser.edit_eat_users(req.body, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};