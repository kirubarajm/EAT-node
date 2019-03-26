'use strict';

var Moveituser = require('../../model/moveit/moveitUserModel.js');
var MoveitRatingForMakeit = require('../../model/moveit/moveitRatingForMakeitModel');

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
  var newdocument = {};
  var new_user = new Moveituser(req.body);
      // newdocument.driver_lic = req.body.driver_lic;
      // newdocument.vech_insurance = req.body.vech_insurance;
      // newdocument.vech_rcbook = req.body.vech_rcbook;
      // newdocument.photo = req.body.photo;
      // newdocument.legal_document = req.body.legal_document;

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


exports.moveitSearch = function(req, res) {
  Moveituser.getAllmoveitSearch(req.body,function(err, user) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', user);
    res.send(user);
  });
};


exports.moveit_live_status = function(req, res) {
  Moveituser.update_online_status(req.body, function(err, user) {
     if (err)
       res.send(err);
     res.json(user);
   });
 };
 

 exports.moveit_kitchen_qualitycheck = function (req, res) {
  var kitchenquality = new MoveitRatingForMakeit(req.body);
  var kitchenqualitylist = req.body.qualitychecklist

  if(!kitchenqualitylist){

    res.status(400).send({ error:true, message: 'Please provide kitchenqualitylist' });

}
else{

    MoveitRatingForMakeit.create_moveit_kitchen_qualitycheck(kitchenquality,kitchenqualitylist, function (err, result) {
      if (err)
        res.send(err);
      res.json(result);
    });
}
};

exports.moveit_kitchen_rating = function (req, res) {

  MoveitRatingForMakeit.MoveitRatingForMakeit(req.body, function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};

exports.admin_read_a_user = function(req, res) {
  Moveituser.admin_getUserById(req.params.userid, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};



exports.moveit_quality_checklist = function (req, res) {

  MoveitRatingForMakeit.get_moveit_quality_checklist(req.body, function (err, result) {
    if (err)
      res.send(err);
    res.json(result);
  });
};