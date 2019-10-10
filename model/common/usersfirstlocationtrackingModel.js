"user strict";
var sql = require("../db.js");

//Task object constructor
var Locationtracking = function(Locationtracking) {
  this.userid = Locationtracking.userid;
  this.lat = Locationtracking.lat;
  this.lon = Locationtracking.lon;
  this.address = Locationtracking.address;
  this.locality = Locationtracking.locality||'';
  this.city = Locationtracking.city||'';
  //this.created_at = new Date();
};

Locationtracking.createLocationtracking = function createLocationtracking(tunnelflow, result) {
    console.log(tunnelflow);
  sql.query("INSERT INTO users_first_location_tracking set ?", tunnelflow, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

Locationtracking.getLocalityById = function getLocalityById(id, result) {
  sql.query("Select * from users_first_location_tracking where localityid = ? ", id, function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Locationtracking.getAllLocality = function getAllLocality(result) {
  sql.query("Select * from users_first_location_tracking", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};


module.exports = Locationtracking;
