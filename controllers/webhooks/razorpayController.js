"use strict";

var Razorpay = require("../../model/webhooks/razorpayModel.js");

exports.testapi = function(req, res) {
  Razorpay.testingapi(req.body, function(err, dunzo) {
        if (err) res.send(err);
        res.json(dunzo);
      });
    
};