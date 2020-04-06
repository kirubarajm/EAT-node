"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeitreferral = function(makeitreferral) {
  this.makeit_id   = makeitreferral.makeit_id;
  this.referred_makeit_id         = makeitreferral.referred_makeit_id;
  this.referrel_incentive_amount  = makeitreferral.referrel_incentive_amount;
  this.from_date   = makeitreferral.from_date;
  this.to_date     = makeitreferral.to_date;  
};

Makeitreferral.createmakeitreferral = function createmakeitreferral(req) {
  sql.query("INSERT INTO Makeit_referral_history  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Makeit referral history created successfully"
      };
      //result(null, resobj);
    }
  });
};


module.exports = Makeitreferral;