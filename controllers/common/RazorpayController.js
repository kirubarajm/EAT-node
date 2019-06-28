"use strict";

var Razorpay = require("../../model/common/razorpayModel");

exports.razorpay_refund_payment = function(req, res) {
  if (!req.body.paymentid) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide payment id"
      });
  }else if (!req.body.amount) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide amount"
      });
  } else {
    Razorpay.razorpay_refund_payment_by_paymentid(req.body, function(
      err,
      razorpay
    ) {
      console.log("controller");
      if (err) res.send(err);
      console.log("res", razorpay);
      res.send(razorpay);
    });
  }
};
