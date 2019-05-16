"use strict";

var Eatuser = require("../../model/eat/eatUserModel.js");

exports.list_all_eatuser = function(req, res) {
  Eatuser.getAllUser(function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.create_a_eatuser = function(req, res) {
  var new_user = new Eatuser(req.body);
  //handles null error
  if (!new_user.name) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide name " });
  } else if (!new_user.phoneno) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide phoneno" });
  } else if (!new_user.password) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide password" });
  } else {
    Eatuser.createUser(new_user, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.read_a_user = function(req, res) {
  Eatuser.getUserById(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.update_a_user = function(req, res) {
  Eatuser.updateById(req.params.userid, new Eatuser(req.body), function(
    err,
    user
  ) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.delete_a_user = function(req, res) {
  Eatuser.remove(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json({ message: "Eatuser successfully deleted" });
  });
};

exports.list_all_virtual_eatuser = function(req, res) {
  Eatuser.getAllVirtualUser(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.virtual_eatusersearch = function(req, res) {
  // console.log(req.params.phoneno);
  Eatuser.virtual_eatusersearch(req.params.search, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.eat_dish_list = function(req, res) {
  Eatuser.get_eat_dish_list(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.eat_makeit_list = function(req, res) {
  Eatuser.get_eat_makeit_list(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.eat_makeit_product_list = function(req, res) {
  Eatuser.get_eat_makeit_product_list(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.eat_dish_sort_filter = function(req, res) {
  if (!req.body.lat) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide lat" });
  } else if (!req.body.lon) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide lan" });
  } else {
    Eatuser.get_eat_dish_list_sort_filter(req.body, function(err, user) {
      console.log("controller");
      if (err) res.send(err);
      console.log("res", user);
      res.send(user);
    });
  }
};

exports.eat_kitchen_sort_filter = function(req, res) {
  if (!req.body.lat) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide lat" });
  } else if (!req.body.lon) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide lan" });
  } else {
    Eatuser.get_eat_kitchen_list_sort_filter(req.body, function(err, user) {
      console.log("controller");
      if (err) res.send(err);
      console.log("res", user);
      res.send(user);
    });
  }
};

exports.eat_user_referral = function(req, res) {
  Eatuser.eat_user_referral_code(req.params, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.eatuser_login = function(req, res) {
  var new_user = new Eatuser(req.body);
  //handles null error
  if (!new_user.phoneno) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide phoneno" });
  } else {
    Eatuser.eatuser_login(new_user, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.eatuser_otpverification = function(req, res) {
  //var new_user = new Eatuser(req.body);
  //handles null error
  if (!req.body.oid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide oid" });
  } else if (!req.body.phoneno) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide phone_number"
      });
  } else {
    Eatuser.eatuser_otpverification(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.edit_eat_users = function(req, res) {
  if (!req.body.name) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide name" });
  } else if (!req.body.gender) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide phone_number"
      });
  } else {
    Eatuser.edit_eat_users(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.checklogin = function(req, res) {
  var new_user = new Eatuser(req.body);
  Eatuser.checkLogin(new_user, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.eat_user_post_registration = function(req, res) {
  if (!req.body.email) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide email" });
  } else if (!req.body.password) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide password" });
  } else {
    Eatuser.eat_user_post_registration(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.eat_user_forgot_password = function(req, res) {
  if (!req.body.phoneno) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide phoneno" });
  } else {
    Eatuser.eat_user_forgot_password_byuserid(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.eat_user_forgot_password_update = function(req, res) {
  if (!req.body.password) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide password" });
  } else if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else {
    Eatuser.eat_user_forgot_password_update(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.add_a_pushid = function(req, res) {
  Eatuser.update_pushid(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.create_customerid_by_razorpay = function(req, res) {
  Eatuser.create_customerid_by_razorpay(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};
