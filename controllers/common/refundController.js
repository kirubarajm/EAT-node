"use strict";
var RefundModel = require("../../model/common/refundonlineModel");

exports.get_all_refund_list = function(req, res) {
    RefundModel.get_all_refunds(req,function(err, refundList) {
        if (err) res.send(err);
        res.send(refundList);
  });
};

exports.get_all_refund_list_filter = function(req, res) {
  RefundModel.get_all_refund_list_filter(req.body,function(err, refundList) {
      if (err) res.send(err);
      res.send(refundList);
});
};