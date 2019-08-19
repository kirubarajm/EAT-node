"use strict";

var Collection = require("../../model/common/collectionModel");

exports.list_all_collection = function(req, res) {
    Collection.list_all_active_collection(req.params,function(err, result) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", result);
    res.send(result);
  });
};

exports.createcollection = function(req, res) {
  var rc =new Collection(req.body);
  Collection.createcollection(rc, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};


exports.enable_disable_collection = function(req, res) {
    Collection.updateBycollectionId(cid,req.params.activestatus, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
};

exports.read_all_collection_by_userid = function(req, res) {
    Collection.getarefundcollection_by_userid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.delete_a_collection = function(req, res) {
    Collection.remove(req.params.cid, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.get_all_collection_by_cid= function(req, res) {
    Collection.get_all_collection_by_cid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};



exports.read_all_collection_by_userid = function(req, res) {
  Collection.getAllCollection_by_user(req.params, function(err, result) {
  if (err) res.send(err);
  res.json(result);
});
}