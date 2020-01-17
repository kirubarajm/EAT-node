"user strict";
var sql = require("../db.js");

//Task object constructor
var Eatfeedback = function(eatfeedback) {
  this.rating = eatfeedback.rating;
  this.content = eatfeedback.content;
  this.userid = eatfeedback.userid;
};

Eatfeedback.createfeedback = function createfeedback(newfeedback, result) {
  sql.query("INSERT INTO Eat_Feedback set ?", newfeedback, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Thanks for your Feedback",
        faqid: res.insertId
      };

      result(null, resobj);
    }
  });
};

Eatfeedback.getfeedbackById = function getfeedbackById(feedbackId, result) {
  sql.query("Select * from Faq where Eat_Feedback = ? ", feedbackId, function(
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

Eatfeedback.getfeedbackByType = function getfeedbackById(id, result) {
  sql.query("Select * from Eat_Feedback where type = ? ", id, function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

Eatfeedback.getAllfeedback = function getAllfeedback(result) {
  sql.query(
    "Select ef.fid,ef.rating,ef.content,ef.userid,ef.created_at,us.name,us.userid,us.phoneno from Eat_Feedback ef join User us on ef.userid=us.userid ",
    function(err, res) {
      if (err) {
        result(null, err);
      } else {
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

Eatfeedback.getAllfeedbackWithFilter = function getAllfeedbackWithFilter(req,result) {
  var limit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * limit;
  var searchquery = "(us.name LIKE  '%" + req.search + "%')";
  var query ="Select ef.fid,ef.rating,ef.content,ef.userid,ef.created_at,us.name,us.userid,us.phoneno from Eat_Feedback ef join User us on ef.userid=us.userid";
  if(req.search){
    query = query + " where "+searchquery;
  }

  query = query + " order by created_at DESC";

  var limitquery = query +" limit " +startlimit +"," +limit;
  
  sql.query(query+";"+limitquery,
    function(err, res) {
      if (err) {
        result(null, err);
      } else {
        let resobj = {
          success: true,
          status:true,
          page_limit:limit,
          totalpagecount:res[0].length,
          result: res[1]
        };
        result(null, resobj);
      }
    }
  );
};

module.exports = Eatfeedback;
