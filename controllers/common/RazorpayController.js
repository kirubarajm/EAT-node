"use strict";

var Razorpay = require("../../model/common/razorpayModel");

exports.razorpay_refund_payment = function(req, res) {
    Razorpay.razorpay_refund_payment_by_paymentid(req.body,function(err, razorpay) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", razorpay);
    res.send(razorpay);
  });
};
