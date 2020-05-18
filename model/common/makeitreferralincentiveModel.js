"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeitreferralincentive = function(makeitreferralincentive) {
  this.makeit_id       = makeitreferralincentive.makeit_id;
  this.referred_makeit_id         = makeitreferralincentive.referred_makeit_id;
  this.referrel_incentive_amount    = makeitreferralincentive.referrel_incentive_amount;
  this.from_date      = makeitreferralincentive.from_date;
  this.to_date  = makeitreferralincentive.to_date;
};

Makeitreferralincentive.createmakeitreferralincentive = function createmakeitreferralincentive(req) {
  sql.query("INSERT INTO Makeit_referral_history  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "makeit referral incentive created successfully"
      };
      //result(null, resobj);
    }
  });
};


module.exports = Makeitreferralincentive;