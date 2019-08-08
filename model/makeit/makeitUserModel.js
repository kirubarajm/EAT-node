"user strict";
var sql = require("../db.js");
var constant = require("../constant.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var request = require("request");
var moment = require("moment");
//var OrderModel = require("../../model/common/orderModel");
var Cusinemakeit = require("../../model/makeit/cusinemakeitModel");
var MakeitImages = require("../../model/makeit/makeitImagesModel");
var MakeitBadges = require("../../model/makeit/makeitbadgesmappingModel");
var PushConstant = require("../../push/PushConstant.js");
var Notification = require("../../model/common/notificationModel.js");

//Task object constructor
var Makeituser = function(makeituser) {
  this.name = makeituser.name;
  this.email = makeituser.email;
  this.phoneno = makeituser.phoneno;
  this.bank_account_no = makeituser.bank_account_no;
  this.verified_status = makeituser.verified_status || "0";
  this.appointment_status = makeituser.appointment_status || 0;
  this.referalcode = makeituser.referalcode;
  this.localityid = makeituser.localityid;
  this.lat = makeituser.lat;
  this.lon = makeituser.lon;
  this.password = makeituser.password;
  this.brandname = makeituser.brandname || "";
  //  this.created_at = new Date();
  this.bank_name = makeituser.bank_name;
  this.ifsc = makeituser.ifsc;
  this.bank_holder_name = makeituser.bank_holder_name;
  this.address = makeituser.address;
  this.virtualkey = makeituser.virtualkey || 0;
  this.rating = makeituser.rating;
  this.regionid = makeituser.regionid;
  this.costfortwo = makeituser.costfortwo;
  this.landmark = makeituser.landmark;
  this.locality = makeituser.locality;
  this.flatno = makeituser.flatno;
  this.pincode = makeituser.pincode;
  this.hometownid = makeituser.hometownid;
  this.img1 = makeituser.img1;
  this.gender = makeituser.gender;
  this.food_type = makeituser.food_type;
  this.member_type = makeituser.member_type;
  this.about = makeituser.about;
  this.virutal_rating_count = makeituser.virutal_rating_count;
  this.ka_status = makeituser.ka_status || 0;
};

Makeituser.createUser = function createUser(newUser, result) {
  sql.query(
    "Select * from MakeitUser where phoneno = '" +
      newUser.phoneno +
      "' OR email= '" +
      newUser.email +
      "' ",
    function(err, res2) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        if (res2.length == 0) {
          sql.query("INSERT INTO MakeitUser set ?", newUser, function(
            err,
            res3
          ) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              var referalcode = "MAKEITWELL" + res3.insertId;

              sql.query(
                "Select userid,name,email,bank_account_no,phoneno,appointment_status from MakeitUser where userid = ? ",
                res3.insertId,
                function(err, res4) {
                  if (err) {
                    console.log("error: ", err);
                    result(err, null);
                  } else {
                    sql.query(
                      "Update MakeitUser set referalcode = '" +
                        referalcode +
                        "' where userid = ? ",
                      res3.insertId,
                      function(err, res5) {
                        if (err) {
                          console.log("error: ", err);
                          result(err, null);
                        } else {
                          let sucobj = true;
                          let message = "Registration Successfully";
                          let resobj = {
                            success: sucobj,
                            status: true,
                            message: message,
                            result: res4
                          };

                          result(null, resobj);
                        }
                      }
                    );
                  }
                }
              );
            }
          });
        } else {
          let sucobj = true;
          let message =
            "Following user already Exist! Please check it mobile number / email";
          let resobj = {
            success: sucobj,
            status: false,
            message: message
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.getUserById = async function getUserById(userId, result) {
  //var query1 = "select mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey from MakeitUser as mu join Documents_Sales as ds on mu.userid = ds.makeit_userid join Documents as st on ds.docid = st.docid where mu.userid = '"+userId+"'";
  //var query1 = "Select * from MakeitUser where userid = '" + userId + "'";
  // JSON_OBJECT('img1',mk.img1,'img2',mk.img2,'img3',mk.img3,'img4',mk.img4) As Images
  var query1 =
    "select mk.userid, mk.ka_status,mk.name, mk.email,bank_account_no, mk.phoneno, mk.lat, mk.brandname, mk.lon, mk.localityid, mk.appointment_status, mk.verified_status, mk.referalcode, mk.created_at, mk.bank_name, mk.ifsc, mk.bank_holder_name, mk.address, mk.virtualkey, mk.img1,mk.regionid, mk.costfortwo, mk.pushid_android, mk.updated_at, mk.branch_name, mk.rating, mk.hometownid,ht.hometownname,re.regionname,mk.food_type,mk.member_type,mk.about,mk.virutal_rating_count,mkh.makeithub_id,mkh.makeithub_name, JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cu.cuisineid,'cuisinename',cu.cuisinename,'cid',cm.cid)) AS cuisines from MakeitUser mk  join Cuisine_makeit cm on cm.makeit_userid=mk.userid  left join Hometown ht on ht.hometownid=mk.hometownid left join Region re on re.regionid=ht.regionid join Cuisine cu on cu.cuisineid=cm.cuisineid left join Makeit_hubs mkh on mkh.makeithub_id=mk.makeithub_id where userid = '" +
    userId +
    "'";
  sql.query(query1, async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }
      }

      const specialitems = await query(
        "select img_id,img_url,type from Makeit_images where makeitid=" +
          userId +
          " and type = 3 limit 4"
      );
      const kitcheninfoimage = await query(
        "select img_id,img_url,type from Makeit_images where makeitid=" +
          userId +
          " and type = 2 limit 4"
      );
      const kitchenmenuimage = await query(
        "select img_id,img_url,type from Makeit_images where makeitid=" +
          userId +
          " and type = 4 limit 4"
      );
      const Signature = await query(
        "select img_id,img_url,type from Makeit_images where makeitid=" +
          userId +
          " and type = 1 limit 1"
      );

      const foodbadge = await query(
        "select mbm.id,mbm.id,mb.url as badges from Makeit_badges_mapping mbm join  Makeit_badges mb on mbm.id = mb.id where mbm.makeit_id=" +
          userId +
          ""
      );

      const images = await query(
        "select st.url,st.docid,st.type from Documents_Sales as ds join Documents as st on ds.docid = st.docid where ds.makeit_userid = '" +
          userId +
          "'"
      );
      // var special = await query("select * from Makeit_images ");
      res[0].Specialitiesfood = specialitems;
      res[0].kitcheninfoimage = kitcheninfoimage;
      res[0].kitchenmenuimage = kitchenmenuimage;
      // res[0].Signature =[]
      // if (Signature.length !== 0) {
      res[0].Signature = Signature;
      // }

      res[0].foodbadge = foodbadge;
      res[0].gallery = images;

      sql.query(
        "select st.url,st.docid,st.type from Documents_Sales as ds join Documents as st on ds.docid = st.docid where ds.makeit_userid = '" +
          userId +
          "'",
        function(err, images) {
          if (err) {
            console.log("error: ", err);
            result(null, err);
          } else {
            res[0].gallery = images;
            let sucobj = true;
            let resobj = {
              success: sucobj,
              result: res
            };

            result(null, resobj);
          }
        }
      );
    }
  });
};

Makeituser.getAllUser = function getAllUser(result) {
  //  sql.query("Select * from MakeitUser", function (err, res) {

  var query =
    "select mk.userid, mk.name, mk.email,bank_account_no, mk.phoneno, mk.lat, mk.brandname, mk.lon, mk.localityid, mk.appointment_status, mk.verified_status, mk.referalcode, mk.created_at, mk.bank_name, mk.ifsc, mk.bank_holder_name, mk.address, mk.virtualkey, mk.img1, mk.regionid, mk.costfortwo, mk.pushid_android, mk.updated_at, mk.branch_name, mk.rating, JSON_OBJECT('cuisines', JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cu.cuisineid,'cuisinename',cu.cuisinename))) AS cuisines from MakeitUser mk  left join Cuisine_makeit cm on cm.makeit_userid=mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid";

  sql.query(query, function(err, res) {
    // sql.query("select concat('[',GROUP_CONCAT(CONCAT('{"url :"', st.url,'"}')),']') url ,mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey  from MakeitUser as mu join Documents_Sales as ds on mu.userid = ds.makeit_userid join Documents as st on ds.docid = st.docid where mu.userid = 1 group by mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey ", function (err, res) {
    //  sql.query("SELECT JSON_OBJECT('Orderid', ci.orderid,'Item', JSON_ARRAYAGG(JSON_OBJECT('Quantity', ci.quantity,'Productid', ci.productid))) AS ordata FROM Orders co JOIN OrderItem ci ON ci.orderid = co.orderid GROUP BY co.orderid", function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      for (let i = 0; i < res.length; i++) {
        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }
      }

      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Makeituser.getAllUserByAppointment = function getAllUserByAppointment(result) {
  //  sql.query("Select * from MakeitUser where appointment_status=1 order by created_at DESC", function (err, res) {
  sql.query(
    " Select alc.*,mu.address,mu.brandname,mu.email,mu.flatno,mu.appointment_status,mu.name,mu.phoneno,mu.pincode,mu.userid from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid where mu.appointment_status = 1",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("User : ", res);

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

Makeituser.updateById = function(id, user, result) {
  sql.query(
    "UPDATE MakeitUser SET task = ? WHERE userid = ?",
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

Makeituser.remove = function(id, result) {
  sql.query("DELETE FROM MakeitUser WHERE userid = ?", [id], function(
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

Makeituser.checkLogin = function checkLogin(req, result) {
  var reqs = [req.phoneno, req.password];
  sql.query(
    "Select * from MakeitUser where phoneno = ? and password = ?",
    reqs,
    function(err, res) {
      if (err) {
        console.log("error: ", err);

        let resobj = {
          success: "false",
          result: err
        };
        result(resobj, null);
      } else {
        if (res.length !== 0) {
          if (res[0].virtualkey === 0) {
            let sucobj = res.length !== 0 ? true : false;
            let status = res.length !== 0 ? true : false;
            let resobj = {
              success: sucobj,
              status: status,
              result: res
            };
            console.log("result: ---", res.length);
            result(null, resobj);
          } else {
            let resobj = {
              success: true,
              message: "Sorry your not a valid user!",
              status: false
            };

            result(null, resobj);
          }
        } else {
          let resobj = {
            success: true,
            message: "Sorry your not a valid user!",
            status: false
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.update_makeit_users_bankaccount = function(user, result) {
  var query =
    "UPDATE MakeitUser SET bank_name = '" +
    user.bank_name +
    "', ifsc='" +
    user.ifsc +
    "', bank_account_no='" +
    user.bank_account_no +
    "', bank_holder_name='" +
    user.bank_holder_name +
    "',branch_name='" +
    user.branch_name +
    "' WHERE userid = '" +
    user.userid +
    "'";
  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      // result(null, err);
      returnResponse(400, false, "error", err);
    } else {
      //result(null, res);
      returnResponse(true, true, "Payment Registration Succdessfully");
    }
  });

  function returnResponse(success, status, message) {
    result({
      success: success,
      status: status,
      message: message
    });
  }
};

Makeituser.createAppointment = function createAppointment(req, result) {
  sql.query(
    "INSERT INTO Bookingtime (makeit_userid, date_time) values (?,?) ",
    [req.makeit_userid, req.date_time],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        sql.query(
          "UPDATE MakeitUser SET appointment_status = 1 WHERE userid = ?",
          req.makeit_userid,
          function(err, res) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            }

            sql.query(
              "Select userid,name,email,bank_account_no,phoneno,appointment_status from MakeitUser where userid = ? ",
              req.makeit_userid,
              function(err, res) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  let sucobj = true;
                  let message = "Appointment Created Successfully";
                  let resobj = {
                    success: sucobj,
                    message: message,
                    result: res
                  };

                  result(null, resobj);
                }
              }
            );
          }
        );
      }
    }
  );
};

// Makeituser.orderviewbymakeituser = function (id, result) {
//     console.log(id.orderid);

//     var temp = [];
//     sql.query("select ot.productid,pt.product_name,ot.quantity,ot.price,ot.gst,ot.created_at,ot.orderid from OrderItem ot left outer join Product pt on ot.productid = pt.productid where ot.orderid = '" + id.orderid + "'", function (err, res) {

//         if (err) {
//             console.log("error: ", err);
//             result(null, err);
//         }
//         else {
//             // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
//             sql.query("select * from Orders where orderid = '" + id.orderid + "'", function (err, responce) {

//                 if (err) {
//                     console.log("error: ", err);
//                     result(null, err);
//                 }
//                 else {

//                     temp = responce;
//                     let sucobj = true;
//                     let resobj = {
//                         success: sucobj,
//                         result: res,
//                         data: temp
//                     };

//                     result(null, resobj);
//                 }
//             });

//         }
//     });
// };

Makeituser.orderviewbymakeituser = function(req, result) {
  sql.query(
    "select * from Orders where orderid =" + req.orderid + " ",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res.length === 0) {
          let sucobj = true;
          let message = "Order not found!";
          let resobj = {
            success: sucobj,
            status: false,
            message: message,
            result: res
          };

          result(null, resobj);
        } else {
          // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
          sql.query(
            "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.orderid =" +
              req.orderid +
              " ",
            function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                for (let i = 0; i < res.length; i++) {
                  eta = 15 + 3 * res[i].distance;
                  //15min Food Preparation time , 3min 1 km
                  res[i].eta = Math.round(eta) + " mins";

                  if (res[i].userdetail) {
                    res[i].userdetail = JSON.parse(res[i].userdetail);
                  }

                  if (res[i].makeitdetail) {
                    res[i].makeitdetail = JSON.parse(res[i].makeitdetail);
                  }
                  if (res[i].moveitdetail) {
                    res[i].moveitdetail = JSON.parse(res[i].moveitdetail);
                  }

                  if (res[i].items) {
                    var items = JSON.parse(res[i].items);
                    res[i].items = items.item;
                  }
                }

                let sucobj = true;
                let status = true;
                let resobj = {
                  success: sucobj,
                  status: status,
                  result: res
                };

                result(null, resobj);
              }
            }
          );
        }
      }
    }
  );
};

Makeituser.orderlistbyuserid = function(id, result) {
  if (id) {
    var query =
      "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid WHERE ors.makeit_user_id  = '" +
      id +
      "' and  ors.lock_status = 0 and DATE(ors.ordertime) = CURDATE() group by orderid order by orderid  desc";
  } else {
    var query = "select * from Orders order by orderid desc";
  }

  sql.query(query, function(err, res1) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      for (let i = 0; i < res1.length; i++) {
        if (res1[i].userdetail) {
          res1[i].userdetail = JSON.parse(res1[i].userdetail);
        }

        if (res1[i].makeitdetail) {
          res1[i].makeitdetail = JSON.parse(res1[i].makeitdetail);
        }
        if (res1[i].moveitdetail) {
          res1[i].moveitdetail = JSON.parse(res1[i].moveitdetail);
        }

        if (res1[i].items) {
          var items = JSON.parse(res1[i].items);
          res1[i].items = items;
        }
      }

      let resobj = {
        success: true,
        status: true,
        result: res1
      };

      result(null, resobj);
    }
  });
};

Makeituser.orderhistorybyuserid = function(id, result) {
  if (id) {
    var query =
      "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid WHERE makeit_user_id  = '" +
      id +
      "' and (ors.orderstatus = 6 or ors.orderstatus = 7) group by orderid order by orderid  desc";
  } else {
    var query = "select * from Orders order by orderid desc";
  }

  sql.query(query, function(err, res1) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      for (let i = 0; i < res1.length; i++) {
        if (res1[i].userdetail) {
          res1[i].userdetail = JSON.parse(res1[i].userdetail);
        }

        if (res1[i].makeitdetail) {
          res1[i].makeitdetail = JSON.parse(res1[i].makeitdetail);
        }
        if (res1[i].moveitdetail) {
          res1[i].moveitdetail = JSON.parse(res1[i].moveitdetail);
        }

        if (res1[i].items) {
          var items = JSON.parse(res1[i].items);
          res1[i].items = items;
        }
      }

      let resobj = {
        success: true,
        status: true,
        result: res1
      };

      result(null, resobj);
    }
  });
};

Makeituser.all_order_list = function(result) {
  var query = "select * from Orders order by orderid desc";

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Makeituser.appointment_info = function(makeit_id, result) {
  var query =
    "select alc.status,alc.booking_date_time,su.name as sales_name from Allocation as alc left join Sales_QA_employees as su on su.id=alc.sales_emp_id where alc.makeit_userid='" +
    makeit_id +
    "' order by aid desc";

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = true;
      res[0].statusInfo =
        res[0].status === 2
          ? "Info session"
          : res[0].status === 4
          ? "Sales Appointment"
          : res[0].status === 0
          ? "Wating for Sales man"
          : "Sales man reached.";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

Makeituser.all_order_list_bydate = function(req, result) {
  console.log(req.body);
  sql.query(
    "select * from Orders WHERE ordertime BETWEEN '" +
      req.startdate +
      "' AND '" +
      req.enddate +
      "' order by orderid desc",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("User : ", res);

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

Makeituser.orderstatusbyorderid = function(req, result) {
  var transaction_time = moment().format("YYYY-MM-DD HH:mm:ss");
  sql.query(
    "UPDATE Orders SET orderstatus = ?,makeit_actual_preparing_time='" +
      transaction_time +
      "' WHERE orderid = ?",
    [req.orderstatusid, req.orderid],
    async function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        await Notification.orderEatPushNotification(
          req.orderid,
          null,
          PushConstant.masteridOrder_Prepared
        );
        await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Prepared,null);
        let sucobj = true;
        let mesobj = "Status Updated Successfully";
        let resobj = {
          success: sucobj,
          status: sucobj,
          message: mesobj
        };

        result(null, resobj);
      }
    }
  );
};

Makeituser.get_admin_list_all_makeitusers = function(req, result) {
  req.appointment_status = req.appointment_status || "all";
  req.virtualkey = req.virtualkey;

  //    rsearch = req.search || ''

  //  var query = "select mk.userid, mk.name, mk.email,bank_account_no, mk.phoneno, mk.lat, mk.brandname, mk.lon, mk.localityid, mk.appointment_status, mk.verified_status, mk.referalcode, mk.created_at, mk.bank_name, mk.ifsc, mk.bank_holder_name, mk.address, mk.virtualkey, mk.img, mk.region, mk.costfortwo, mk.pushid_android, mk.updated_at, mk.branch_name, mk.rating,JSON_OBJECT('cuisines', JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cu.cuisineid,'cuisinename',cu.cuisinename))) AS cuisines from MakeitUser mk  join Cuisine_makeit cm on cm.makeit_userid=mk.userid  join Cuisine cu on cu.cuisineid=cm.cuisineid";
  var query = "select * from MakeitUser";

  var searchquery = "name LIKE  '%" + req.search + "%'";

  if (
    req.appointment_status !== "all" &&
    req.virtualkey !== "all" &&
    !req.search
  ) {
    query =
      query +
      " WHERE appointment_status  = '" +
      req.appointment_status +
      "' and virtualkey  = '" +
      req.virtualkey +
      "'";
  } else if (req.virtualkey !== "all" && !req.search) {
    query = query + " WHERE virtualkey  = '" + req.virtualkey + "'";
  } else if (req.appointment_status !== "all" && !req.search) {
    query =
      query + " WHERE appointment_status  = '" + req.appointment_status + "'";
  } else if (
    req.appointment_status !== "all" &&
    req.virtualkey !== "all" &&
    req.search
  ) {
    query =
      query +
      " WHERE appointment_status  = '" +
      req.appointment_status +
      "' and virtualkey  = '" +
      req.virtualkey +
      "' and " +
      searchquery;
  } else if (req.virtualkey !== "all" && req.search) {
    query =
      query + " WHERE virtualkey  = '" + req.virtualkey + "'and " + searchquery;
  } else if (req.appointment_status !== "all" && req.search) {
    query =
      query +
      " WHERE appointment_status  = '" +
      req.appointment_status +
      "'and " +
      searchquery;
  } else if (req.search) {
    query = query + " where " + searchquery;
  }

  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      // for (let i = 0; i < res.length; i++) {

      //    if (res[i].cuisines) {
      //     res[i].cuisines = JSON.parse(res[i].cuisines)
      //    }

      // }

      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Makeituser.admin_get_unapproved_makeitlist = function(req, result) {
  var query = "select * from MakeitUser where ka_status=1";
  var searchquery =
    " and name LIKE  '%" +
    req.search +
    "%' OR us.brandname LIKE '%" +
    req.search +
    "%'";
  if (req.search) {
    query = query + searchquery;
  }
  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status: true,
        result: res
      };

      result(null, resobj);
    }
  });
};
Makeituser.updatemakeit_user_approval = function(req, result) {
  console.log("updatemakeit_user_approval-->" + req);
  req.ka_status = parseInt(req.ka_status);
  var appointment_status = req.ka_status === 1 ? 3 : 2;
  sql.query(
    "UPDATE MakeitUser SET appointment_status = '" +
      appointment_status +
      "' ,ka_status = '" +
      req.ka_status +
      "' WHERE userid = ?",
    req.makeit_userid,
    async function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        await update_allocation(req.makeit_userid, req.sales_emp_id);

        let message =
          req.ka_status === 1
            ? "Kitchen approved successfully."
            : "Kitchen decline successfully.";
        let resobj = {
          success: true,
          status: true,
          message: message
          //result: res
        };

        result(null, resobj);
      }
    }
  );
};

function update_allocation(makeit_userid, sales_emp_id) {
  sql.query(
    "UPDATE Allocation SET status = 1 WHERE makeit_userid = ? and sales_emp_id = ?",
    [makeit_userid, sales_emp_id],
    function(err, res) {
      if (err) {
        return false;
      } else {
        return true;
      }
    }
  );
}

Makeituser.update_makeit_followup_status = function(
  makeitfollowupstatus,
  result
) {
  sql.query(
    "UPDATE MakeitUser SET appointment_status = ? WHERE makeit_userid = ? ",
    [makeitfollowupstatus.status, makeitfollowupstatus.makeit_userid],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      }
    }
  );
};

//cart details for ear user
Makeituser.read_a_cartdetails_makeitid = async function read_a_cartdetails_makeitid(req,orderitems,isMobile,result) {
  var tempmessage = "";
  var makeit_error_message = "";
  var coupon__error_message = "";
  var refundcoupon__error_message = "";
  var gst = constant.gst;
  var delivery_charge = constant.deliverycharge;
  const productdetails = [];
  var totalamount = 0;
  var product_orginal_price = 0;
  var amount = 0;
  var refund_coupon_adjustment = 0;
  var coupon_discount_amount = 0;
  var refund_balance = 0;
  var refundlist = [];
  var isAvaliableItem = true;
  var calculationdetails = {};
  var couponstatus = true;
  var refundcouponstatus = true;
  var isAvaliablekitchen = true;
 

  var orderlist = await query("Select * From Orders where userid = '" +req.userid +"' and orderstatus >= 6");
  var ordercount = orderlist.length;


  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");

  var productquery="breakfast";
//  if (currenthour <= 12) {
//    productquery = " breakfast";
//  }else
  if(currenthour >= 12 && currenthour <= 16){
   productquery =  "lunch";
   }else if( currenthour >= 16){
   productquery = "dinner";
 }


  for (let i = 0; i < orderitems.length; i++) {

    const res1 = await query("Select pt.*,cu.cuisinename From Product pt join Cuisine cu on cu.cuisineid = pt.cuisine where pt.productid = '" +orderitems[i].productid +"'  ");
  
    if (res1[0].quantity < orderitems[i].quantity) {
      console.log("quantity");
      res1[0].availablity = false;
      tempmessage = tempmessage + res1[0].product_name + ",";
      isAvaliableItem = false;
    }else if (res1[0].approved_status != 2) {
      console.log("approved_status");
      res1[0].availablity = false;
      tempmessage = tempmessage + res1[0].product_name + ",";
      isAvaliableItem = false;
    }else if (res1[0].delete_status !=0) {
      console.log("delete_status");
      res1[0].availablity = false;
      tempmessage = tempmessage + res1[0].product_name + ",";
      isAvaliableItem = false;
    }else if (res1[0].active_status != 1) {
      console.log("active_status");
      res1[0].availablity = false;
      tempmessage = tempmessage + res1[0].product_name + ",";
      isAvaliableItem = false;
    }else if (res1[0][productquery] !== 1) {
      console.log("cycle_status");
      res1[0].availablity = false;
      tempmessage = tempmessage + res1[0].product_name + ",";
      isAvaliableItem = false;
    }   else {
      res1[0].availablity = true;
    }
    amount = res1[0].price * orderitems[i].quantity;
    res1[0].amount = amount;
    res1[0].cartquantity = orderitems[i].quantity;
    totalamount = totalamount + amount;
    productdetails.push(res1[0]);
  }
  console.log(productdetails);
  // This query is to get the makeit details and cuisine details
  var query1 =
    "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.regionid,re.regionname,ly.localityname,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename,'cid',cm.cid)) AS cuisines from MakeitUser mk left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid=" +
    req.userid +
    " left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid join Cuisine_makeit cm on cm.makeit_userid=mk.userid  join Cuisine cu on cu.cuisineid=cm.cuisineid where mk.userid =" +
    req.makeit_user_id;

  // var query1 = 'call cart_makeituser_details(?,?)';

  sql.query(query1,async function(err,res2) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      console.log(res2);
      if (res2[0].makeituserid === null) {
        let resobj = {
          success: true,
          status: false,
          message: "There is no data available!, Kindly check the Makeituser id"
        };
        result(null, resobj);
      }else{

        if(isMobile){
        // eat delivery avalibility check
          var makeitavailability = await query(
            "Select distinct mk.userid,mk.brandname,mk.lat,mk.lon,( 3959 * acos( cos( radians(" +
            req.lat +
              ") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians(" +
              req.lon +
              ") ) + sin( radians(" +
              req.lat +
              ") ) * sin(radians(mk.lat)) ) ) AS distance from MakeitUser mk where mk.userid ='" +
              req.makeit_user_id +
              "' and mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2"
          );

  
        var eta = 15 + 3 * makeitavailability[0].distance;
          //15min Food Preparation time , 3min 1 km
          if (makeitavailability[0].distance > constant.radiuslimit && eta > constant.eat_delivery_min) {
          
              isAvaliablekitchen = false;
              makeit_error_message = makeitavailability[0].brandname;
          }
        }

        res2[0].isAvaliablekitchen = isAvaliablekitchen;
        for (let i = 0; i < res2.length; i++) {
          if (res2[i].cuisines) {
            res2[i].cuisines = JSON.parse(res2[i].cuisines);
          }
        }
        product_orginal_price = totalamount;

        //offer coupon amount detection algorithm
        if (req.cid) {
          var couponlist = await query(
            "Select * From Coupon where cid = '" +
              req.cid +
              "' and active_status = 1"
          );
        
          if (couponlist.length != 0) {
            var maxdiscount = couponlist[0].maxdiscount;
            var numberoftimes = couponlist[0].numberoftimes;
            var discount_percent = couponlist[0].discount_percent;
            var minprice_limit = couponlist[0].minprice_limit
            var CouponsUsedlist = await query(
              "Select * From CouponsUsed where cid = '" +
                req.cid +
                "' and userid = '" +
                req.userid +
                "'"
            );
            var couponusedcount = CouponsUsedlist.length;

            if (totalamount >=minprice_limit) {
              
              minprice_limit_status = true

              if (couponusedcount < numberoftimes) {
               
              var discount_amount = (totalamount / 100) * discount_percent;
              discount_amount = Math.round(discount_amount);
                           
              if (discount_amount >= maxdiscount) {

                                         discount_amount = maxdiscount;
                }

              if (totalamount >= discount_amount) {
               
                totalamount = totalamount - discount_amount;
                coupon_discount_amount = discount_amount;
              }else{
                couponstatus = false;
                coupon__error_message = "coupon amount is too high";
              }
            }else{
              couponstatus = false;
              coupon__error_message = "coupon has been expired";
            }
            }else{
              couponstatus = false;
              coupon__error_message = "Please makeit minimum order values is " + minprice_limit;
            }
          }else{

            couponstatus = false;
              coupon__error_message = "Coupon is not available";
          }
        }
        
        var gstcharge = (totalamount / 100) * gst;
        gstcharge = Math.round(gstcharge);
        var original_price =gstcharge+product_orginal_price+delivery_charge;
        var grandtotal = gstcharge+totalamount+delivery_charge;


        //refund coupon amount detection algorithm 
        if (req.rcid) {
          refundlist = await query(
            "Select * From Refund_Coupon where rcid = '" +
              req.rcid +
              "' and active_status = 1"
          );
          if (refundlist.length !== 0) {
          
            // get refund amount
            if (grandtotal >= refundlist[0].refundamount) {
              refund_coupon_adjustment = refundlist[0].refundamount;
            } else if (grandtotal < refundlist[0].refundamount) {
              refund_balance = refundlist[0].refundamount - grandtotal;
              refund_coupon_adjustment = grandtotal;
            }
  
            //get price
            grandtotal = grandtotal - refundlist[0].refundamount;
            //if grandtotal is lesser then 0 define grandtotal is 0
            if (grandtotal < 0) grandtotal = 0;
            calculationdetails.refundamount = refundlist[0].refundamount;
          }else{

            refundcouponstatus = false;
            refundcoupon__error_message = "refundcoupon is not available";
          }
        }
        
        calculationdetails.grandtotaltitle = "Grand Total";
        calculationdetails.grandtotal = grandtotal;
        calculationdetails.original_price = original_price;
        calculationdetails.refund_balance = refund_balance;
        calculationdetails.gstcharge = gstcharge;
        calculationdetails.delivery_charge = delivery_charge;
        calculationdetails.refund_coupon_adjustment = refund_coupon_adjustment;
        calculationdetails.product_orginal_price = product_orginal_price;
        calculationdetails.totalamount = totalamount;
        calculationdetails.coupon_discount_amount = coupon_discount_amount;
        calculationdetails.couponstatus = false;
        calculationdetails.refundcouponstatus = false

        if (req.cid && couponstatus) {
          calculationdetails.couponstatus = couponstatus;
        }
        if (req.rcid && refundcouponstatus) {
        calculationdetails.refundcouponstatus = refundcouponstatus;
      }

        var cartdetails = [];
        var totalamountinfo = {};
        var couponinfo = {};
        var gstinfo = {};
        var deliverychargeinfo = {};
        var refundinfo = {};
        //var grandtotalinfo = {};

          totalamountinfo.title = "Total Amount";
          totalamountinfo.charges = product_orginal_price;
          totalamountinfo.status = true;
          cartdetails.push(totalamountinfo);

          if (req.cid && couponstatus) {
            couponinfo.title = "Coupon adjustment";
            couponinfo.charges = coupon_discount_amount;
            couponinfo.status = true;
            cartdetails.push(couponinfo);
          }

          gstinfo.title = "GST charge";
          gstinfo.charges = gstcharge;
          gstinfo.status = true;
          cartdetails.push(gstinfo);

          deliverychargeinfo.title = "Delivery charge";
          deliverychargeinfo.charges = delivery_charge;
          deliverychargeinfo.status = true;
          cartdetails.push(deliverychargeinfo);

          if (req.rcid && refundcouponstatus) {
            refundinfo.title = "Refund adjustment";
            refundinfo.charges = refund_coupon_adjustment;
            refundinfo.status = true;
            cartdetails.push(refundinfo);
          }

          // grandtotalinfo.title = "Grand total";
          // grandtotalinfo.grandtotal = grandtotal;
          // grandtotalinfo.status = true;
          // cartdetails.push(grandtotalinfo);

        
        res2[0].amountdetails = calculationdetails;
        res2[0].item = productdetails;
        res2[0].ordercount = ordercount;
        res2[0].cartdetails = cartdetails;


        let resobj = {
          success: true,
          status: isAvaliableItem
        };

  
        if (!refundcouponstatus){
          resobj.message = refundcoupon__error_message;
          resobj.status = refundcouponstatus
        }
    
        if (!couponstatus){
          resobj.message = coupon__error_message;
          resobj.status = couponstatus
        }

        if (!isAvaliableItem){
          resobj.message = tempmessage.slice(0, -1) + " is not avaliable";
          resobj.status = isAvaliableItem
        }
       if (!isAvaliablekitchen){
          resobj.message = makeit_error_message.slice(0, -1) + " kitchen service is not available! for your following address";
          resobj.status = isAvaliablekitchen
       }

          resobj.result = res2; 
          result(null, resobj);
      } 
    }
  });
};

Makeituser.admin_check_cartdetails = async function admin_check_cartdetails(req,orderitems,result) {
  var tempmessage = "";
  var gst = constant.gst;
  var delivery_charge = constant.deliverycharge;
  const productdetails = [];
  var totalamount = 0;
  var amount = 0;
  var isAvaliableItem = true;
  var calculationdetails = {};

  for (let i = 0; i < orderitems.length; i++) {
    const res1 = await query(
      "Select * From Product where productid = '" +
        orderitems[i].productid +
        "'"
    );
    if (res1[0].quantity < orderitems[i].quantity) {
      res1[0].availablity = false;
      tempmessage = tempmessage + res1[0].product_name + ",";
      isAvaliableItem = false;
    } else {
      res1[0].availablity = true;
    }
    amount = res1[0].price * orderitems[i].quantity;
    res1[0].amount = amount;
    res1[0].cartquantity = orderitems[i].quantity;
    totalamount = totalamount + amount;
    productdetails.push(res1[0]);
  }
  var query1 =
    "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.regionid,re.regionname,ly.localityname,mk.img1 as makeitimg,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename,'cid',cm.cid)) AS cuisines from MakeitUser mk  left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid join Cuisine_makeit cm on cm.makeit_userid=mk.userid  join Cuisine cu on cu.cuisineid=cm.cuisineid where mk.userid =" +
    req.makeit_user_id;

  sql.query(query1, function(err, res1) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res1.length; i++) {
        if (res1[i].cuisines) {
          res1[i].cuisines = JSON.parse(res1[i].cuisines);
        }
      }

      if (res1.length !== 0) {
        var gstcharge = (totalamount / 100) * gst;

        gstcharge = Math.round(gstcharge);

        const grandtotal = +gstcharge + +totalamount + +delivery_charge;

        calculationdetails.grandtotal = grandtotal;
        calculationdetails.gstcharge = gstcharge;
        calculationdetails.totalamount = totalamount;
        calculationdetails.delivery_charge = delivery_charge;
        res1[0].amountdetails = calculationdetails;
        res1[0].item = productdetails;
        let resobj = {
          success: true,
          status: isAvaliableItem
        };
        if (!isAvaliableItem)
          resobj.message = tempmessage.slice(0, -1) + " is not avaliable";
        (resobj.result = res1), result(null, resobj);
      } else {
        let sucobj = true;
        let status = false;
        message = "There is no data available!, Kindly check the Makeituser id";
        let resobj = {
          success: sucobj,
          status: status,
          message: message
        };

        result(null, resobj);
      }
    }
  });
};

Makeituser.edit_makeit_users = async function(req, cuisines, result) {
  try {
    var removecuisines = req.removecuisines || [];
    var removeimages = req.removeimages || [];
    var kitcheninfoimage = req.kitcheninfoimage || [];
    var kitchenmenuimage = req.kitchenmenuimage || [];
    var Specialitiesfood = req.Specialitiesfood || [];
    var Signature = req.Signature || [];
    var badges = req.badges || [];
    var removebadges = req.removebadges || [];

    cuisinesstatus = false;
    removecuisinesstatus = false;
    var column = "";
    var editquery = "";
    console.log(removeimages[0]);
    //get regionid using homedown id
    if (req.hometownid) {
      const hometown = await query(
        "Select * from Hometown where hometownid=" + req.hometownid
      );
      console.log(hometown);
      req.regionid = hometown[0].regionid;
    }

    //mailid ,password/phone numer can't be edit check validation
    if (req.email || req.password || req.phoneno) {
      let message = "You can't to be Edit email / password/ phoneno";
      let resobj = {
        success: true,
        status: false,
        message: message
      };
      result(null, resobj);
    } else {
      staticquery = "UPDATE MakeitUser SET ";
      for (const [key, value] of Object.entries(req)) {
        if (
          key !== "userid" &&
          key !== "cuisines" &&
          key !== "region" &&
          key !== "rating" &&
          key !== "removecuisines" &&
          key !== "kitcheninfoimage" &&
          key !== "kitchenmenuimage" &&
          key !== "Specialitiesfood" &&
          key !== "Signature" &&
          key !== "removeimages" &&
          key !== "badges" &&
          key !== "removebadges"
        ) {
          column = column + key + "='" + value + "',";
        } else if (key === "rating") {
          column = column + key + "= " + value + ",";
        }
      }

      editquery =
        staticquery + column.slice(0, -1) + " where userid = " + req.userid;

      console.log("query: ", editquery);

      sql.query(editquery, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          if (cuisines !== undefined) {
            if (cuisines.length !== 0) {
              cuisinesstatus = true;
              cuisines_temp = 0;
              for (let i = 0; i < cuisines.length; i++) {
                var new_cuisine = new Cusinemakeit(cuisines[i]);
                new_cuisine.makeit_userid = req.userid;
                Cusinemakeit.createCusinemakeit(new_cuisine, function(
                  err,
                  res2
                ) {
                  if (err) {
                    console.log("error: ", err);
                    result(err, null);
                  } else {
                    cuisines_temp++;
                  }
                });
              }
            }
          }

          if (removecuisines.length !== 0) {
            removecuisinesstatus = true;

            for (let i = 0; i < removecuisines.length; i++) {
              var new_cid = removecuisines[i].cid;

              Cusinemakeit.remove(new_cid, function(err, res3) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  // remove_temp++;
                }
              });
            }
          }

          if (removeimages.length !== 0) {
            removeimagesstatus = true;

            MakeitImages.remove(removeimages, function(err, res3) {
              if (err) {
                console.log("error: ", err);
                result(err, null);
              } else {
                // remove_temp++;
              }
            });
          }

          if (removebadges.length !== 0) {
            removebadgesstatus = true;

            MakeitBadges.remove(removebadges, function(err, res3) {
              if (err) {
                console.log("error: ", err);
                result(err, null);
              } else {
                // remove_temp++;
              }
            });
          }

          if (kitcheninfoimage.length !== 0) {
            kitcheninfoimagestatus = true;

            console.log("kitchenmenuimage:2 ");
            for (let i = 0; i < kitcheninfoimage.length; i++) {
              var new_kitcheninfoimage = new MakeitImages(kitcheninfoimage[i]);
              new_kitcheninfoimage.makeitid = req.userid;
              MakeitImages.createMakeitImages(new_kitcheninfoimage, function(
                err,
                createMakeitImages
              ) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  //cuisines_temp++;
                }
              });
            }
          }

          if (kitchenmenuimage.length !== 0) {
            kitchenmenuimagestatus = true;

            console.log("kitchenmenuimage:4 ");

            for (let i = 0; i < kitchenmenuimage.length; i++) {
              console.log("kitchenmenuimage: ", kitchenmenuimage[i]);
              var new_kitchenmenuimage = new MakeitImages(kitchenmenuimage[i]);
              new_kitchenmenuimage.makeitid = req.userid;
              MakeitImages.createMakeitImages(new_kitchenmenuimage, function(
                err,
                createMakeitImages
              ) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  //cuisines_temp++;
                }
              });
            }
          }

          if (Specialitiesfood.length !== 0) {
            Specialitiesfoodstatus = true;

            console.log("kitchenmenuimage:3 ");
            for (let i = 0; i < Specialitiesfood.length; i++) {
              var new_Specialitiesfood = new MakeitImages(Specialitiesfood[i]);
              new_Specialitiesfood.makeitid = req.userid;
              MakeitImages.createMakeitImages(new_Specialitiesfood, function(
                err,
                createMakeitImages
              ) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  //cuisines_temp++;
                }
              });
            }
          }

          if (Signature.length !== 0) {
            Signaturestatus = true;

            console.log("kitchenmenuimage:1 ");
            for (let i = 0; i < Signature.length; i++) {
              var new_Signature = new MakeitImages(Signature[i]);
              new_Signature.makeitid = req.userid;
              MakeitImages.createMakeitImages(new_Signature, function(
                err,
                createMakeitImages
              ) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  //cuisines_temp++;
                }
              });
            }
          }

          if (badges.length !== 0) {
            badgesstatus = true;

            for (let i = 0; i < badges.length; i++) {
              var new_badges = new MakeitBadges(badges[i]);
              new_badges.makeit_id = req.userid;
              MakeitBadges.createMakeitBadges(new_badges, function(
                err,
                createMakeitImages
              ) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  //cuisines_temp++;
                }
              });
            }
          }

          let message = "Updated successfully";

          let resobj = {
            success: true,
            status: true,
            message: message
          };

          result(null, resobj);
        }
      });
    }
  } catch (error) {
    var errorCode = 402;
    let sucobj = true;
    let status = false;
    let resobj = {
      success: sucobj,
      status: status,
      errorCode: errorCode
    };
    result(null, resobj);
  }
};

Makeituser.update_makeit_regionid = async function(req, result) {
  console.log(req);

  const updatestatus = await query(
    "UPDATE MakeitUser SET regionid = '" +
      req.regionid +
      "' WHERE userid = '" +
      req.userid +
      "' "
  );
  console.log(updatestatus);
  // sql.query("UPDATE MakeitUser SET regionid = '"+req.regionid+"' WHERE userid = '"+req.userid+"' ",function(err, res) {
  //     if (err) {
  //       console.log("error: ", err);
  //       result(null, err);
  //     }else{

  let resobj = {
    success: true,
    status: true
  };
  result(null, resobj);
  //     }
  //   }
  // );
};

Makeituser.makeituser_user_referral_code = function makeituser_user_referral_code(
  req,
  result
) {
  var applink = constant.applink;
  console.log(req);
  sql.query(
    "select referalcode from MakeitUser where userid = '" + req.userid + "'",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log(res[0]);
        if (res[0] === undefined) {
          let message = "User is not available";
          let resobj = {
            success: true,
            status: false,
            message: message,
            result: res
          };

          result(null, resobj);
        } else {
          res[0].applink =
            "https://play.google.com/store/apps/details?id=com.tovo.eat&referrer=utm_source%3Dreferral%26utm_medium%3D" +
            res[0].referalcode +
            "%26utm_campaign%3Dreferral";

          // https://play.google.com/store/apps/details?id=com.tovo.eat&referrer=utm_source%3Dreferral%26utm_medium%3Deat001%26utm_campaign%3Dreferral
          // console.log("TEST: ",  referralcode);

          let resobj = {
            success: true,
            status: true,
            result: res
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.makeit_user_send_otp_byphone = function makeit_user_send_otp_byphone(
  newUser,
  result
) {
  sql.query(
    "Select * from MakeitUser where phoneno = '" + newUser.phoneno + "'",
    function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        if (res1.length == 0) {
          var OTP = Math.floor(Math.random() * 90000) + 10000;

          var otpurl =
            "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
            newUser.phoneno +
            "&senderId=EATHOM&message=Your EAT App OTP is " +
            OTP +
            ". Note: Please DO NOT SHARE this OTP with anyone.";

          request(
            {
              method: "GET",
              rejectUnauthorized: false,
              url: otpurl
            },
            function(error, response, body) {
              if (error) {
                console.log("error: ", err);
                result(null, err);
              } else {
                console.log(response.statusCode, body);
                var responcecode = body.split("#");
                console.log(responcecode);

                if (responcecode[0] === "0") {
                  sql.query(
                    "insert into Otp(phone_number,apptype,otp)values('" +
                      newUser.phoneno +
                      "',4,'" +
                      OTP +
                      "')",
                    function(err, res1) {
                      if (err) {
                        console.log("error: ", err);
                        result(null, err);
                      } else {
                        let resobj = {
                          success: true,
                          status: true,
                          message: responcecode[1],
                          oid: res1.insertId
                        };

                        result(null, resobj);
                      }
                    }
                  );
                } else {
                  let resobj = {
                    success: true,
                    status: false,
                    message: responcecode[1],
                    passwordstatus: passwordstatus,
                    otpstatus: otpstatus,
                    genderstatus: genderstatus
                  };

                  result(null, resobj);
                }
              }
            }
          );
        } else {
          let sucobj = true;
          let message =
            "Following user already Exist! Please check it mobile number";
          let resobj = {
            success: sucobj,
            status: false,
            message: message
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.makeit_user_otpverification = function makeit_user_otpverification(
  req,
  result
) {
  var otp = 0;
  var passwordstatus = false;
  var otpstatus = false;
  var genderstatus = false;

  sql.query("Select * from Otp where oid = '" + req.oid + "'", function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      //  console.log(res[0].otp);
      if (res[0].otp == req.otp) {
        sql.query(
          "Select * from MakeitUser where phoneno = '" + req.phoneno + "'",
          function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              console.log(res1.length);
              if (res1.length == 1) {
                console.log("OTP VALID");
                let message = "OTP verified successfully";
                let sucobj = true;

                let resobj = {
                  success: sucobj,
                  status: true,
                  message: message,
                  userid: res1[0].userid
                };

                result(null, resobj);
              } else {
                let message = "OTP verified successfully";
                let sucobj = true;

                let resobj = {
                  success: sucobj,
                  status: true,
                  message: message
                };

                result(null, resobj);
              }
            }
          }
        );
      } else {
        console.log(res[0]);
        console.log("OTP FAILED");
        let message = "OTP is not valid!, Try once again";
        let sucobj = true;

        let resobj = {
          success: sucobj,
          status: false,
          message: message
        };

        result(null, resobj);
      }
    }
  });
};

Makeituser.makeit_user_forgot_password_update = function makeit_user_forgot_password_update(
  newUser,
  result
) {
  sql.query(
    "UPDATE MakeitUser SET password = '" +
      newUser.password +
      "'  where userid = '" +
      newUser.userid +
      "'",
    function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        let resobj = {
          success: true,
          status: true,
          message: "Password Updated successfully"
        };

        result(null, resobj);
      }
    }
  );
};

Makeituser.makeit_user_forgot_password_send_otp = function makeit_user_forgot_password_send_otp(
  newUser,
  result
) {
  var OTP = Math.floor(Math.random() * 90000) + 10000;

  var otpurl =
    "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
    newUser.phoneno +
    "&senderId=EATHOM&message=Your EAT App OTP is " +
    OTP +
    ". Note: Please DO NOT SHARE this OTP with anyone.";

  request(
    {
      method: "GET",
      rejectUnauthorized: false,
      url: otpurl
    },
    function(error, response, body) {
      if (error) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(response.statusCode, body);
        var responcecode = body.split("#");

        if (responcecode[0] === "0") {
          sql.query(
            "insert into Otp(phone_number,apptype,otp)values('" +
              newUser.phoneno +
              "',4,'" +
              OTP +
              "')",
            function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                let resobj = {
                  success: true,
                  status: true,
                  message: responcecode[1],
                  oid: res.insertId
                };

                result(null, resobj);
              }
            }
          );
        } else {
          let resobj = {
            success: true,
            status: false,
            message: responcecode[1]
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.sum_total_earnings_makeit = function(makeit_userid, result) {
  var query =
    "select SUM(price) as earnings from Orders where makeit_user_id = '" +
    makeit_userid +
    "' and orderstatus = 6 and payment_status = 1";

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      var query =
        "select SUM(price) as earnings,ordertime from Orders where makeit_user_id = '" +
        makeit_userid +
        "' and orderstatus = 6 and payment_status = 1 GROUP BY date(ordertime)  order by ordertime desc";
      sql.query(query, function(err, res1) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
          var query =
            "select SUM(price) AS weeklyearnings , CONCAT(ordertime, '-', ordertime + INTERVAL 7 DAY) AS week FROM Orders where makeit_user_id = '" +
            makeit_userid +
            "' and orderstatus = 6 and payment_status = 1 GROUP BY week(ordertime)ORDER BY week(ordertime) desc";
          sql.query(query, function(err, res2) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {
              var query =
                "select count(ordertime) as totalmonth from Orders where  makeit_user_id = '" +
                makeit_userid +
                "' and orderstatus = 6 and payment_status = 1 GROUP BY ordertime ";
              sql.query(query, function(err, res3) {
                if (err) {
                  console.log("error: ", err);
                  result(null, err);
                } else {
                  res[0].dayearnings = res1;
                  res[0].weekearnings = res2;
                  res[0].monthlyaverage = res[0].earnings / 12;
                  console.log(res3);
                  if (res[0].earnings === null) {
                    let sucobj = true;
                    let message = "Sorry there is no orders found!";
                    let resobj = {
                      success: sucobj,
                      status: false,
                      message: message,
                      result: res
                    };

                    result(null, resobj);
                  } else {
                    let sucobj = true;
                    let message = "Total earnings";
                    let resobj = {
                      success: sucobj,
                      status: true,
                      message: message,
                      result: res
                    };

                    result(null, resobj);
                  }
                }
              });
            }
          });
        }
      });
    }
  });
};

Makeituser.makeit_document_store_by_userid = async function makeit_document_store_by_userid(
  newdocument,
  result
) {
  try {
    temp = 0;
    doclen = newdocument.length;
    if (newdocument) {
      for (let i = 0; i < newdocument.length; i++) {
        const documentstore = await query(
          "insert into Makeit_images (Makeit_images,makeit_userid)values('" +
            newdocument[i].Makeit_images +
            "','" +
            newdocument[i].makeit_userid +
            "')"
        );

        temp++;
      }
    }

    if (temp === doclen) {
      let resobj = {
        success: true,
        status: true,
        message: "Document uploaded succssfully"
      };
      result(null, resobj);
    }
  } catch (error) {
    var errorCode = 402;
    let sucobj = true;
    let status = false;
    let resobj = {
      success: sucobj,
      status: status,
      errorCode: errorCode
    };
    result(null, resobj);
  }
};

Makeituser.update_pushid = function(req, result) {
  var staticquery = "";
  if (req.pushid_android && req.userid) {
    staticquery =
      "UPDATE MakeitUser SET pushid_android ='" +
      req.pushid_android +
      "'   where userid = " +
      req.userid +
      " ";
  } else if (req.pushid_ios && req.userid) {
    staticquery =
      "UPDATE MakeitUser SET pushid_ios ='" +
      req.pushid_ios +
      "'  where userid = " +
      req.userid +
      " ";
  }

  if (staticquery.length === 0) {
    let sucobj = true;
    let message = "There no valid data";
    let resobj = {
      success: sucobj,
      status: false,
      message: message
    };

    result(null, resobj);
  } else {
    sql.query(staticquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let sucobj = true;
        let message = "Updated successfully";
        let resobj = {
          success: sucobj,
          status: true,
          message: message
        };

        result(null, resobj);
      }
    });
  }
};

Makeituser.edit_makeit_brand_identity_by_sales = async function(
  req,
  cuisines,
  result
) {
  try {
    cuisinesstatus = false;
    removecuisinesstatus = false;
    var column = "";
    var editquery = "";

    if (req.hometownid) {
      const hometown = await query(
        "Select * from Hometown where hometownid=" + req.hometownid
      );
      console.log(hometown);
      req.regionid = hometown[0].regionid;
    }

    if (req.email || req.password || req.phoneno) {
      let sucobj = true;
      let message = "You can't to be Edit email / password/ phoneno";
      let resobj = {
        success: sucobj,
        message: message
      };
      result(null, resobj);
    } else {
      staticquery = "UPDATE MakeitUser SET ";
      for (const [key, value] of Object.entries(req)) {
        if (
          key !== "makeit_userid" &&
          key !== "cuisines" &&
          key !== "region" &&
          key !== "rating" &&
          key !== "removecuisines"
        ) {
          column = column + key + "='" + value + "',";
        } else if (key === "rating") {
          column = column + key + "= " + value + ",";
        }
      }

      editquery =
        staticquery +
        column.slice(0, -1) +
        " where userid = " +
        req.makeit_userid;

      sql.query(editquery, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          if (cuisines !== undefined) {
            if (cuisines.length !== 0) {
              cuisinesstatus = true;
              cuisines_temp = 0;
              for (let i = 0; i < cuisines.length; i++) {
                var new_cuisine = new Cusinemakeit(cuisines[i]);
                new_cuisine.makeit_userid = req.makeit_userid;
                Cusinemakeit.createCusinemakeit(new_cuisine, function(
                  err,
                  res2
                ) {
                  if (err) {
                    console.log("error: ", err);
                    result(err, null);
                  } else {
                    cuisines_temp++;
                  }
                });
              }
            }
          }

          let sucobj = true;
          let message = "Updated successfully";

          let resobj = {
            success: sucobj,
            status: true,
            message: message
          };

          result(null, resobj);
        }
      });
    }
  } catch (error) {
    var errorCode = 402;
    let sucobj = true;
    let status = false;
    let resobj = {
      success: sucobj,
      status: status,
      errorCode: errorCode
    };
    result(null, resobj);
  }
};

module.exports = Makeituser;
