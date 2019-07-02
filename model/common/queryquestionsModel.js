"user strict";
var sql = require("../db.js");
var QueryAnswer = require("../../model/common/queryanswerModel");
var moment = require("moment");
//Task object constructor
var QueryQuestions = function(queryquestions) {
  this.question = queryquestions.question;
  this.type = queryquestions.type;
  this.userid = queryquestions.userid;
  this.admin_read = queryquestions.admin_read || 0;
  // this.created_at = new Date();
};

QueryQuestions.createquestions = function createquestions(req, result) {
  sql.query("INSERT INTO Query_questions  set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = true;
      let message = "Questions created successfully";
      let resobj = {
        success: sucobj,
        message: message
      };

      result(null, resobj);
    }
  });
};

QueryQuestions.read_a_question_id = function read_a_question_id(req, result) {
  var query =
    "SELECT qqs.* ,SUM(CASE WHEN qa.user_read = 0 THEN 1 ELSE 0 END) AS un_read_count FROM Query_questions AS qqs LEFT JOIN Query_answers AS qa ON (qqs.qid = qa.qid)";
  if (req.type) {
    query = query + "WHERE qqs.type='" + req.type + "'";
  }
  if (req.userid) {
    query = query + " and qqs.userid='" + req.userid + "'";
  }

  query = query + "GROUP BY qqs.qid ORDER BY qa.created_at desc";

  console.log(query);

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = true;
      let resobj = {
        sucobj: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });

  //               async function  getunreadcount(userid,qid){

  //                let count = await sql.query("Select COUNT(*) as count from Query_answers where userid = '"+userid+"' and user_read = 0 and qid = '"+qid+"' group by user_read");

  //               // count = await res1;
  //                 console.log(count)
  //                  return count;
  //              }
  // } catch (error) {
  //     var errorCode = 402;
  // }
};

QueryQuestions.getFaqByType = function getFaqById(id, result) {
  sql.query("Select * from Query_questions where type = ? ", id, function(
    err,
    res
  ) {
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

QueryQuestions.getAllFaq = function getAllFaq(result) {
  sql.query("Select * from Query_questions", function(err, res) {
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

QueryQuestions.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Query_questions SET task = ? WHERE faqid = ?",
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

QueryQuestions.remove = function(id, result) {
  sql.query("DELETE FROM Query_questions WHERE faqid = ?", [id], function(
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

QueryQuestions.getAllFaqbyid = function getAllFaqByid(id, result) {
  sql.query("Select * from Query_questions where faqid = ? ", id, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Faq : ", res);
      result(null, res);
    }
  });
};


QueryQuestions.update_read_answer_by_admin = function(req, result) {
  var temp = 0;
  var qidlist = req.qidlist;
  //var date = Date.now();

  var date = moment().format("YYYY-MM-DD HH:mm:ss");

  // console.log();

  for (let i = 0; i < qidlist.length; i++) {
    var query =
      "UPDATE Query_questions SET admin_read = 0, updated_at = '" +
      date +
      "' WHERE qid = '" +
      qidlist[i].qid +
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

  if (temp === qidlist.length) {
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
module.exports = QueryQuestions;
