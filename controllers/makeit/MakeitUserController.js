'use strict';

var Makeituser = require('../../model/makeit/makeitUserModel.js');

exports.list_all_user = function(req, res) {
  Makeituser.getAllUser(function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};



exports.create_a_user = function(req, res) {
  var new_user = new Makeituser(req.body);
  //handles null error 
   if(!new_user.name || !new_user.phoneno){
            res.status(400).send({ error:true, message: 'Please provide name/phoneno' });
    }
  else{
  Makeituser.createUser(new_user, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
  }


 function returnResponse(statusHttp, statusBool, message, data) {
        resultData({
            statusHttp: statusHttp,
            statusBool: statusBool,
            message: message,
            data: data
        });
    }

};

exports.creat_a_appointment = function(req, res) {
/*  var new_user = new Makeituser(req.body);
   if(!new_user.name || !new_user.phoneno){
            res.status(400).send({ error:true, message: 'Please provide name/phoneno' });
    }
  else{*/
  Makeituser.createAppointment(req.body, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
  //}
};



exports.list_all_appointment = function(req, res) {
  Makeituser.getAllUserByAppointment(function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};



exports.read_a_user = function(req, res) {
  Makeituser.getUserById(req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.checklogin = function(req, res) {
  var new_user = new Makeituser(req.body);
  Makeituser.checkLogin(new_user, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.update_a_user = function(req, res) {
 Makeituser.updateById(req.params.userid, new Makeituser(req.body), function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.update_payment_registration = function(req, res) {
 Makeituser.updatePaymentById(req.params.userid, new Makeituser(req.body), function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.delete_a_user = function(req, res) {
 Makeituser.remove( req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json({ message: 'Makeituser successfully deleted' });
  });
};



exports.orderview = function(req, res) {
  Makeituser.orderviewbymakeituser( req.params, function(err, result) {
     if (err)
       res.send(err);
       res.json(result);
   });
 };




 exports.orderlist = function(req, res) {
  console.log(req.params);
  Makeituser.orderlistbyuserid( req.params.id,function(err, result){
    if (err)
    res.send(err);
    res.json(result); 
  });
 };

 exports.orderstatus = function(req, res) {
  
  Makeituser.orderstatusbyorderid( req.body,function(err, result){
    if (err)
    res.send(err);
    res.json(result); 
  });
 };


