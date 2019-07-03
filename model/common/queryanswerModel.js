"user strict";
var sql = require("../db.js");
var masters = require("../master.js");
var constant = require("../constant.js");
var Notification = require("../common/notificationModel.js");
const fs = require("fs");

//Task object constructor
var QueryAnswer = function(queryanswer) {
  this.qid = queryanswer.qid;
  this.answer = queryanswer.answer;
  this.type = queryanswer.type;
  this.adminid = queryanswer.adminid;
  this.userid = queryanswer.userid || 0;
  this.user_read = queryanswer.user_read || 0;
  this.admin_read = queryanswer.admin_read || 0;
  //  this.created_at = new Date();
};

QueryAnswer.createanswer = function createanswer(req, result) {
  console.log(req);
  sql.query("INSERT INTO Query_answers set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = true;
      let message = "replied successfully";
      let resobj = {
        success: sucobj,
        status: true,
        message: message
      };
      Notification.queries_answers_PushNotification(req.userid,req.qid,req.answer,req.type);
      result(null, resobj);
    }
  });
};

QueryAnswer.read_a_replies_id = function read_a_replies_id(qid, result) {
  sql.query("Select * from Query_answers where qid = ? order by aid asc",qid,function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

QueryAnswer.getFaqByType = function getFaqById(id, result) {
  sql.query("Select * from Faq where type = ? ", id, function(err, res) {
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

QueryAnswer.getAllFaq = function getAllFaq(result) {
  sql.query("Select * from Faq", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Faq : ", res);

      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

QueryAnswer.update_read_answer = function(req, result) {
  var temp = 0;
  var aidlist = req.aidlist;
  var date = Date.now();

  // console.log();

  for (let i = 0; i < aidlist.length; i++) {
    var query =
      "UPDATE Query_answers SET user_read = 1, updated_at = '" +
      date +
      "' WHERE aid = '" +
      aidlist[i].aid +
      "'";

    //  console.log(query);
    sql.query(query, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      }
    });

    temp++;
  }

  if (temp === aidlist.length) {
    let sucobj = true;
    let message = "readed successfully";
    let resobj = {
      success: sucobj,
      message: message
    };

    result(null, resobj);
  } else {
    let sucobj = true;
    let message = "not yet be read";
    let resobj = {
      success: sucobj,
      message: message
    };

    result(null, resobj);
  }
};

QueryAnswer.remove = function(id, result) {
  sql.query("DELETE FROM Faq WHERE faqid = ?", [id], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

QueryAnswer.getAllFaqbyid = function getAllFaqByid(id, result) {
  sql.query("Select * from Faq where faqid = ? ", id, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Faq : ", res);
      result(null, res);
    }
  });
};

QueryAnswer.read_a_answer_count = function read_a_answer_count(req, result) {
  sql.query(
    "Select COUNT(*) as count from Query_answers where userid = '" +
      req.userid +
      "' and user_read = 0  and type = 0 group by user_read",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let success = true;
        let resobj = {
          success: success,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

QueryAnswer.read_a_answer_count_by_qid = function read_a_answer_count_by_qid(
  req,
  result
) {
  sql.query(
    "Select COUNT(*) as count from Query_answers where userid = '" +
      req.userid +
      "' and user_read = 0 and qid = '" +
      req.qid +
      "' group by user_read",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

QueryAnswer.read_a_masters = function read_a_masters(req, result) {
  var masterlist = [];
  console.log(masters[0]);
  let resobj = {
    // success:success,

    result: masters
  };
  result(null, resobj);
};

module.exports = QueryAnswer;
