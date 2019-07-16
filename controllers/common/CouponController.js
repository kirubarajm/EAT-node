"use strict";

var Coupon = require("../../model/common/couponModel");

exports.list_all_coupon_by_activestatus = function(req, res) {
  Coupon.getAllcoupon_by_activstatus(req.params.activestatus,function(err, result) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", result);
    res.send(result);
  });
};

exports.createCoupon = function(req, res) {
  var rc =new Coupon(req.body);
  Coupon.createCoupon(rc, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};


exports.enable_disable_Coupon = function(req, res) {
    Coupon.updateByCouponId(cid,req.params.activestatus, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
};

exports.read_all_coupons_by_userid = function(req, res) {
  Coupon.getarefundcoupon_by_userid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.delete_a_Coupon = function(req, res) {
  Coupon.remove(req.params.cid, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.get_all_coupons_by_userid = function(req, res) {
  Coupon.get_coupons_by_userid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};