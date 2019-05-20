"user strict";
var sql = require("../db.js");

//Task object constructor
var Hometown = function(hometown) {
  this.hometownname = hometown.hometownname;
  this.regionid = hometown.regionid;
 
};

Hometown.createHometown = function createHometown(req, result) {
  sql.query("INSERT INTO Hometown  set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = true;
      let message = "Region created successfully";
      let resobj = {
        success: sucobj,
        message: message
      };

      result(null, resobj);
    }
  });
};

Hometown.read_a_question_id = function read_a_question_id(req, result) {
  var query = "Select * from Hometown";

  if (req.type && req.userid) {
    query = query + " and userid = '" + req.userid + "'";
  }
  query = query + "order by qid desc";

  console.log(query);

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
        //res[i].count = count;
      }

      let sucobj = true;
      let resobj = {
        sucobj: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

Hometown.getRegionByType = function getRegionByType(id, result) {
  sql.query("Select * from Hometown where type = ? ", id, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

Hometown.getAllHometown = function getAllHometown(result) {
  sql.query("Select hometownid,hometownname,regionid from Hometown", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};


Hometown.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Hometown SET task = ? WHERE faqid = ?",
    [task.task, id],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

Hometown.remove = function(id, result) {
  sql.query("DELETE FROM Hometown WHERE faqid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

module.exports = Hometown;
