'use strict';

var Makeituser = require('../../model/makeit/makeitUserModel.js');
var Allocation = require('../../model/sales/allocationModel');

exports.list_all_user = function (req, res) {
  Makeituser.getAllUser(function (err, user) {
    console.log('controller')
    if (err)
      res.send(err);
    console.log('res', user);
    res.send(user);
  });
};



exports.create_a_user = function (req, res) {
  var new_user = new Makeituser(req.body);
  var otpdetails = {};
   otpdetails.oid = req.body.oid;
   otpdetails.otp = req.body.otp;
  var new_user = new Makeituser(req.body);
  //handles null error 
  if (!new_user.name ) {
    res.status(400).send({ error: true, message: 'Please provide name ' });
  }else if(!new_user.phoneno){
    res.status(400).send({ error: true, message: 'Please provide phoneno' });
  }else if(!new_user.password){
    res.status(400).send({ error: true, message: 'Please provide password' });
  }
  else {
    Makeituser.createUser(new_user,otpdetails, function (err, user) {
      if (err)
        res.send(err);
      res.json(user);
    });
  }
};

// exports.creat_a_appointment = function(req, res) {
// /*  var new_user = new Makeituser(req.body);
//    if(!new_user.name || !new_user.phoneno){
//             res.status(400).send({ error:true, message: 'Please provide name/phoneno' });
//     }
//   else{*/
//     if(!req.body.makeit_userid || !req.body.date_time){
//       res.status(400).send({ error:true, message: 'Please makeit_userid/date_time' });
// }else{
//   Makeituser.createAppointment(req.body, function(err, user) {
//     if (err)
//       res.send(err);
//     res.json(user);
//   });
// }
// };


exports.creat_a_appointment = function (req, res) {
  var new_allocation = new Allocation(req.body);
  /*  var new_user = new Makeituser(req.body);
     if(!new_user.name || !new_user.phoneno){
              res.status(400).send({ error:true, message: 'Please provide name/phoneno' });
      }
    else{*/
  if (!req.body.makeit_userid) {
    res.status(400).send({ error: true, message: 'Please makeit_userid/date_time' });
  } else {
    Allocation.createAllocation(new_allocation, function (err, user) {
      if (err)
        res.send(err);
      res.json(user);
    });
  }
};



exports.list_all_appointment = function (req, res) {
  Makeituser.getAllUserByAppointment(function (err, user) {
    console.log('controller')
    if (err)
      res.send(err);
    console.log('res', user);
    res.send(user);
  });
};



exports.read_a_user = function (req, res) {
  Makeituser.getUserById(req.params.userid, function (err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.checklogin = function (req, res) {
  var new_user = new Makeituser(req.body);
  Makeituser.checkLogin(new_user, function (err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.update_a_user = function (req, res) {

  console.log(req);
  Makeituser.updateById(req.params.userid, new Makeituser(req.body), function (err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.update_payment_registration = function (req, res) {
  Makeituser.update_makeit_users(req.params.userid, new Makeituser(req.body), function (err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.delete_a_user = function (req, res) {
  Makeituser.remove(req.params.userid, function (err, user) {
    if (err)
      res.send(err);
    res.json({ message: 'Makeituser successfully deleted' });
  });
};



exports.orderview = function (req, res) {
  Makeituser.orderviewbymakeituser(req.params, function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};




exports.orderlist = function (req, res) {
  console.log(req.params);
  Makeituser.orderlistbyuserid(req.params.id, function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};


exports.all_order_list = function (req, res) {
  Makeituser.all_order_list(function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

exports.all_order_list_bydate = function (req, res) {
  // console.log(req.body);
  Makeituser.all_order_list_bydate(req.body, function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};


exports.orderstatus = function (req, res) {

  Makeituser.orderlistbymoveituserid(req.body, function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};



exports.admin_list_all_makeitusers = function (req, res) {
  console.log(req.body);
  Makeituser.get_admin_list_all_makeitusers(req.body, function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};


exports.admin_makeit_user_approval = function (req, res) {

  if (!req.body.makeit_userid || !req.body.verified_status) {
    res.status(400).send({ error: true, message: 'Please makeit_userid/verified_status' });
  } else {
    Makeituser.updatemakeit_user_approval(req.body, function (err, user) {
      if (err)
        res.send(err);
      res.json(user);
    });
  }
};


exports.update_makeit_users = function (req, res) {

  console.log(req);
  Makeituser.update_makeit_users(new Makeituser(req.body), function (err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};


exports.read_a_cartdetails = function (req, res) {
  var orderitems = req.body.orderitems;
  if (!req.body.makeit_user_id) {
    res.status(400).send({ error: true,status:false, message: 'Please provide makeit_user_id' });
  }
  else {
  Makeituser.read_a_cartdetails_makeitid(req.body, orderitems, function (err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};


exports.edit_makeit_user_byid = function (req, res) {

  var cuisines = req.body.cuisines;
  if (!req.body.userid) {
    res.status(400).send({ error: true, message: 'Please provide makeit userid' });
  }
  else {
    Makeituser.edit_makeit_users(req.body,cuisines, function (err, user) {
      if (err)
        res.send(err);
      res.json(user);
    });
  }
};



exports.make_user_referral = function(req, res) {
  Makeituser.makeituser_user_referral_code(req.params,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
}




exports.makeit_user_send_otp = function(req, res) {
  
  if(!req.body.phoneno){
    res.status(400).send({ error: true, message: 'Please provide phoneno' });
  }
  else{
    Makeituser.makeit_user_send_otp_byphone(req.body, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};



exports.makeit_otp_verification = function(req, res) {
  
  if(!req.body.oid){
    res.status(400).send({ error: true, message: 'Please provide oid' });
  }else if(!req.body.phoneno){
    res.status(400).send({ error: true, message: 'Please provide phone_number' });
  }
  else{
    Makeituser.makeit_user_otpverification(req.body, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};


exports.makeit_user_forgot_password_update = function(req, res) {
  
  if(!req.body.password){
    res.status(400).send({ error: true, message: 'Please provide password' });
  }else if(!req.body.userid){
    res.status(400).send({ error: true, message: 'Please provide userid' });
  }
  else{
    Makeituser.makeit_user_forgot_password_update(req.body, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
}
};
