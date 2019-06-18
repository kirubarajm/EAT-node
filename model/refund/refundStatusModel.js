"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var RefundStatus = function(refund) {
  this.orderid = refund.orderid;
  this.original_amt = refund.original_amt;
  this.refund_amt = refund.refund_amt || 0;
  this.status = refund.status || 0;
};

RefundStatus.createRefund = function createRefund(refund, result) {
  sql.query("INSERT INTO Refund_Status set ?",refund, function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true
      };
      result(null, response);
    }
  });
};

RefundStatus.get_all_refunds = function get_all_refunds(req, result) {
  sql.query("select * from Refund_Status", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

RefundStatus.get_unsuccess_refunds = function get_unsuccess_refunds(
  req,
  result
) {
  sql.query("select * from Refund_Status Where status = 0", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

RefundStatus.get_success_refunds = function get_success_refunds(req, result) {
  sql.query("select * from Refund_Status Where status = 1", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

module.exports = RefundStatus;
