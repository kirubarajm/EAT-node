"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Makeitrating = function(makeitrating) {
  this.makeit_userid = makeitrating.makeit_userid;
  this.rating = makeitrating.rating;
  this.sales_emp_id = makeitrating.sales_emp_id;
  //this.created_at = new Date();
};

Makeitrating.createRating = async function createRating(new_rating, result) {
  var rating = await query(
    "Select * from SalesRatingForMakeit where makeit_userid = '" +
      new_rating.makeit_userid +
      "' and sales_emp_id = '" +
      new_rating.sales_emp_id +
      "'"
  );

  if (rating.length === 0) {
    sql.query("INSERT INTO SalesRatingForMakeit set ?", new_rating, function(
      err,
      res
    ) {
      if (err) {
        result(err, null);
      } else {
        update_allocation(
          new_rating.makeit_userid,
          new_rating.sales_emp_id,
          result
        );
      }
    });
  } else {
    var rating_id = rating[0].rating_id;
    var updateRating =
      "UPDATE SalesRatingForMakeit set rating = '" +
      new_rating.rating +
      "' where rating_id ='" +
      rating_id +
      "'";
    sql.query(updateRating, function(err, rating) {
      if (err) {
        res(err, null);
      } else {
        update_allocation(
          new_rating.makeit_userid,
          new_rating.sales_emp_id,
          result
        );
      }
    });
  }
};

function update_allocation(makeit_userid, sales_emp_id, result) {
  sql.query(
    "UPDATE Allocation SET status = 1 WHERE makeit_userid = ? and sales_emp_id = ?",
    [makeit_userid, sales_emp_id],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let mesobj = "Rating Update successfully";
        let resobj = {
          success: true,
          status: true,
          message: mesobj
        };
        result(null, resobj);
      }
    }
  );
}

Makeitrating.getSalesMakeitRating = function getSalesMakeitRating(
  userId,
  result
) {
  sql.query(
    "Select rating from SalesRatingForMakeit where makeit_userid = '" +
      userId +
      "'",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        var ratingDoc = {};
        let status = false;
        if (res.length !== 0) {
          status = true;
          ratingDoc.rating = res[0].rating;
        }
        let resobj = {
          success: true,
          status: status,
          result: ratingDoc
        };
        result(null, resobj);
      }
    }
  );
};

module.exports = Makeitrating;
