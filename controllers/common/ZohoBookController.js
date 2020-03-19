"use strict";

var ZohoBookModel = require("../../model/common/ZohoBookModel");

exports.createZohoCustomer = function(req, res) {
  ZohoBookModel.createZohoCustomer(req.body ,function(err, faq) {
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};






