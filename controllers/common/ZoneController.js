"use strict";
var Zone = require("../../model/common/zoneModel");

////Create Zone Controller
exports.create_a_Zone = function(req, res) {
  var new_Zone = new Zone(req.body);
  Zone.createZone(new_Zone, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////List All Zone Controller
exports.list_all_zone = function(req, res) {
  Zone.get_all_zone(req.body,function(err, faq) {
    if (err) res.send(err);
    res.send(faq);
  });
};

////Update Zone Controller
exports.update_a_Zone = function(req, res) {
  Zone.updateZone(req.body,function(err, faq) {
    if (err) res.send(err);
    res.send(faq);
  });
};

////Get zone based on lat and lng Controller
exports.check_map_boundaries = function(req, res) {
  Zone.check_map_boundaries(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};