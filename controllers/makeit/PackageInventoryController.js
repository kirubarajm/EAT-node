"use strict";

var PackageInventory = require("../../model/makeit/packageInventoryModel.js");

exports.getPackageInventoryList = function(req, res) {
  PackageInventory.getPackageInventoryList(req.params, function(err, result) {
    if (err) res.send(err);
    res.send(result);
  });
};

exports.create_PackageInventory = function(req, res) {
  var package_Inventory = new PackageInventory(req.body);

  if (!package_Inventory.makeit_id) {
    res.status(400).send({ error: true,status:false, message: "Please provide makeit id" });
  }else if (!package_Inventory.packageid) {
    res.status(400).send({ error: true,status:false, message: "Please provide package id" });
  }else if (!package_Inventory.count) {
    res.status(400).send({ error: true,status:false, message: "Please provide package count" });
  } else {
    PackageInventory.createPackageInventory(package_Inventory, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

