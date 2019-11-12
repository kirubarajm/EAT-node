"use strict";

var Zone = require("../../model/common/zoneModel");

exports.list_all_zone = function(req, res) {
    Zone.get_all_zone(req.body,function(err, faq) {
    if (err) res.send(err);
    res.send(faq);
  });
};

exports.create_a_Zone = function(req, res) {
  var new_Zone = new Zone(req.body);
  Zone.createZone(new_Zone, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

