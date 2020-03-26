"user strict";
var sql = require("../db.js");

//Task object constructor
var razorpaySettlement = function(settlement) {
  this.orderid = settlement.orderid;
  this.payment_id = settlement.payment_id;
  this.type = settlement.type;
  this.settlement_id = settlement.settlement_id;
  this.settlement_utr = settlement.settlement_utr;
  this.payment_settled_at = settlement.payment_settled_at;
  this.payment_created_at = settlement.payment_created_at;
};

razorpaySettlement.createRazorpaySettlement = function createRazorpaySettlement(req, result) {
  sql.query("INSERT INTO Razorpay_settlements  set ?", req, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
      };
      result(null, resobj);
    }
  });
};

razorpaySettlement.createRazorpaySettlementBulk = function createRazorpaySettlementBulk(items, result) {
  sql.query("INSERT INTO Razorpay_settlements  (orderid, payment_id, type,settlement_id,settlement_utr,payment_settled_at,payment_created_at) VALUES ?", [items.map(item => [item.orderid, item.entity_id, item.type,item.settlement_id, item.settlement_utr, item.settled_at,item.created_at])], function(err, res) {
    if (err) {
      console.log(err)
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
      };
     if(result) result(null, resobj);
    }
  });
};

module.exports = razorpaySettlement;
