"user strict";
var sql = require("../db.js");
var Makeituser = require("../../model/makeit/makeitUserModel.js");
var moment = require("moment");
var Notification = require("../../model/common/notificationModel.js");


//Task object constructor
var Allocation = function(allocation) {
  this.makeit_userid = allocation.makeit_userid;
  this.sales_emp_id = allocation.sales_emp_id;
  this.assign_date = allocation.assign_date;
  this.assignedby = allocation.assignedby;
  this.status = allocation.status;
  // this.created_at = new Date();
  this.booking_date_time = allocation.booking_date_time;
};

Allocation.createAllocation = function createAllocation(req, result) {
  sql.query("INSERT INTO Allocation set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      console.log(res.insertId);

      sql.query(
        "UPDATE MakeitUser SET appointment_status = 1 WHERE userid = ?",
        req.makeit_userid,
        function(err, res) {
          if (err) {
            console.log("error: ", err);
            result(err, null);
          }
        }
      );

      let sucobj = true;
      let message = "Booking time updated successfully";
      let resobj = {
        success: sucobj,
        message: message,
        result: res.insertId
      };
      result(null, resobj);
    }
  });
};

Allocation.updateAllocation = function updateAllocation(req, result) {
  sql.query(
    "update Allocation set sales_emp_id = ?, assignedby = ?, assign_date = ?, status = ? where makeit_userid = ?",
    [
      req.sales_emp_id,
      req.assignedby,
      new Date(),
      req.status,
      req.makeit_userid
    ],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        sql.query(
          "UPDATE MakeitUser SET appointment_status = 2 WHERE userid = ?",
          req.makeit_userid,
          function(err, res) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              let sucobj = true;
              let message = "Appointment assign successfully";
              let resobj = {
                success: sucobj,
                status: true,
                message: message
              };
              result(null, resobj);
            }
          }
        );
      }
    }
  );
};

Allocation.getAllocationById = function getAllocationById(userId, result) {
  sql.query("Select * from Allocation where aid = ? ", userId, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Allocation.getAllocationBySalesEmpId = function getAllocationBySalesEmpId(
  userid,
  result
) {
  //  sql.query("Select * from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = ? ", userId, function (err, res) {

  sql.query(
    "Select alc.aid,alc.sales_emp_id,alc.makeit_userid,alc.status,alc.booking_date_time,mu.userid as makeit_userid,mu.name as makeit_username,mu.lat,mu.lon,mu.appointment_status,mu.locality,mu.phoneno,mu.address,mu.verified_status from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = '" +
      userid +
      "' and DATE(alc.booking_date_time) = CURDATE() and alc.status !=1 ",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let status = res.length===0?false:true;
        let resobj = {
          success: true,
          status:status,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

Allocation.getAllAllocation = function getAllAllocation(result) {
  sql.query("Select * from Allocation", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Allocation : ", res);

      result(null, res);
    }
  });
};

Allocation.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Allocation SET task = ? WHERE aid = ?",
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

Allocation.remove = function(id, result) {
  sql.query("DELETE FROM Allocation WHERE aid = ?", [id], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Allocation.update_a_followupstatus = function(req, result) {
  var status = parseInt(req.status)
  var statusquery =
    "UPDATE Allocation SET status = " +
    status +
    " WHERE aid ='" +
    req.aid +
    "'";

  

  if (req.scheduledate && (status === 2 || status === 4)) {
    statusquery =
      "UPDATE Allocation SET status = '" +
      status +
      "',booking_date_time = '" +
      req.scheduledate +
      "' WHERE aid  = '" +
      req.aid +
      "' ";
  }

  console.log(statusquery);

  sql.query(statusquery, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = true;
      let mesobj = "Follow up status updated successfully";
      let resobj = {
        success: sucobj,
        message: mesobj
      };
      Notification.appointment_makeit_PushNotification(req.makeit_userid,req.status,req.sales_emp_id,req.scheduledate);
      result(null, resobj);
    }
  });
};

module.exports = Allocation;
