"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeitincentive = function(makeitincentive) {
  this.eligibility       = makeitincentive.eligibility;
  this.makeit_id         = makeitincentive.makeit_id;
  this.complete_succession_count  = makeitincentive.complete_succession_count;
  this.cancel_count      = makeitincentive.cancel_count;
  this.incentive_amount  = makeitincentive.incentive_amount;
};

Makeitincentive.createmakeitincentive = function createmakeitincentive(req) {
  sql.query("INSERT INTO Makeit_incentive  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "makeit incentive created successfully"
      };
      //result(null, resobj);
    }
  });
};


module.exports = Makeitincentive;