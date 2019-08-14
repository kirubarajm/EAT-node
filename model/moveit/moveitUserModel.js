'user strict';
var sql = require('../db.js');
var request = require("request");
var Documentmoveit = require('../../model/common/documentsMoveitModel.js');
var MoveitFireBase =require("../../push/Moveit_SendNotification")
var Constant =require("../constant")
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Moveituser = function (moveituser) {
    this.name = moveituser.name;
    this.email = moveituser.email;
    this.phoneno = moveituser.phoneno;
    this.bank_account_no = moveituser.bank_account_no;
    this.vehicle_no = moveituser.vehicle_no;
    this.verified_status = moveituser.verified_status;
    this.online_status = moveituser.online_status;
    this.referalcode = moveituser.referalcode;
    this.localityid = moveituser.localityid;
    this.password = moveituser.password;
  //  this.created_at = new Date();
    this.bank_name = moveituser.bank_name;
    this.ifsc = moveituser.ifsc;
    this.bank_holder_name = moveituser.bank_holder_name;
    this.moveit_hub = moveituser.moveit_hub;
    this.driver_lic = moveituser.driver_lic;
    this.vech_insurance = moveituser.vech_insurance;
    this.vech_rcbook = moveituser.vech_rcbook;
    this.photo = moveituser.photo;
    this.legal_document = moveituser.legal_document;
    this.branch = moveituser.branch;
    this.address = moveituser.address;
};

Moveituser.createUser = function createUser(newUser, result) {
    sql.query("Select * from MoveitUser where phoneno = '" + newUser.phoneno + "' OR email= '" + newUser.email + "' ", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {

            if (res.length == 0) {

                sql.query("INSERT INTO MoveitUser set ?", newUser, function (err, res1) {

                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else {

                        //    newdocument.moveit_userid = res1.insertId;
                        //    console.log(newdocument);
                        //    newdocument = new Documentmoveit(newdocument);


                        //    Documentmoveit.createnewDocument(newdocument, function (err, result) {
                        //     if (err)
                        //     result.send(err);
                        //     // res.json(result);
                        // });


                        let sucobj = true;
                        let message = 'Moveit user created successfully';
                        let resobj = {
                            success: sucobj,
                            message: message,
                            id: res.insertId

                        };

                        result(null, resobj);

                    }
                });
            } else {

                let sucobj = true;
                let message = "Following user already Exist! Please check it mobile number / email";
                let resobj = {
                    success: sucobj,
                    message: message
                };

                result(null, resobj);
            }
        }
    });
};

Moveituser.getUserById = function getUserById(userId, result) {
    sql.query("Select * From MoveitUser where userid = ? ", userId, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                result: res
            };

            result(null, resobj);

        }
    });
};



Moveituser.admin_getUserById = function getUserById(userId, result) {
    sql.query("Select mu.*,mh.area_name From MoveitUser mu left join Moveit_hubs mh  on mu.moveit_hub = mh.moveithub_id where mu.userid = ? ", userId, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                result: res
            };

            result(null, resobj);

        }
    });
};




Moveituser.getAllUser = function getAllUser(result) {
    sql.query("Select * from MoveitUser", function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('User : ', res);

            result(null, res);
        }
    });
};

Moveituser.updateById = function (id, user, result) {
    sql.query("UPDATE MoveitUser SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Moveituser.remove = function (id, result) {
    sql.query("DELETE FROM MoveitUser WHERE userid = ?", [id], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {

            result(null, res);
        }
    });
};

Moveituser.checkLogin = function checkLogin(req, result) {
    var reqs = [req.phoneno, req.password];
    sql.query("Select * from MoveitUser where phoneno = ? and password = ? limit 1", reqs, function (err, res) {
        if (err) {
            console.log("error: ", err);

            let resobj = {
                success: 'false',
                result: err
            };
            result(resobj, null);
        }
        else {


            let sucobj = (res.length !== 0) ? true : false;
            let status = (res.length !== 0) ? true : false;
            let resobj = {
                success: sucobj,
                status : status,
                result: res
            };
            console.log("result: ---", res.length);
            result(null, resobj);
        }
    });
};





Moveituser.getAllmoveitSearch = function getAllmoveitSearch(req, result) {

    req.vacant = req.vacant || 'all'

    var query = "Select * from MoveitUser";

    console.log(req.vacant);
    if (req.vacant !== 'all') {
        query = query + " where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1 ";
    }

    if (req.vacant !== 'all' && req.search) {
        query = query + " and name LIKE  '%" + req.search + "%'";
    } else if (req.search) {
        query = query + " where name LIKE  '%" + req.search + "%'";
    }

    console.log(query);
    sql.query(query, function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                result: res
            };

            result(null, resobj);

        }
    });
};



Moveituser.update_online_status = function (req, result) {

    sql.query("UPDATE MoveitUser SET online_status = ? WHERE userid = ?", [req.online_status, req.userid], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            if (req.online_status == 1) {
                key = "Moved online";
                key1 = true;
            } else {
                key = "Moved offline";
                key1 = false;
            }
           
            let message = key;
            let onlinestatus = key1;
            let resobj = {
                success: true,
                status:true,
                message: message,
                onlinestatus: onlinestatus
            };

            result(null, resobj);
        }
    });
};

Moveituser.get_a_hub_navigation = function get_a_hub_navigation(req, result) {
    sql.query("select userid,name,mh.* from MoveitUser mu join Moveit_hubs mh on mh.moveithub_id=mu.moveit_hub where mu.userid  = ? ", req.userid, function (err, res) {
        if (err) {
          let error = {
            success: true,
            status:false,
        };
            result(error, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                status:true,
                result: res
            };

            result(null, resobj);

        }
    });
};

Moveituser.get_a_nearby_moveit = async function get_a_location_user(req, result) {
  MoveitFireBase.geoFireGetKeyByGeo(req.geoLocation,Constant.makeit_nearby_moveit_radius,function(err, make_it_id) {
    if (err) {
      let error = {
        success: true,
        status:false,
    };
        result(error, null);
    }
    else{
      var query= "select name,Vehicle_no,address,email,phoneno,userid,online_status from MoveitUser where userid IN ("+make_it_id+") and userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status= 1 ORDER BY FIELD(userid,"+make_it_id+")";
     // console.log("query-->"+query);
      if (req.search) {
        query = query + " and name LIKE  '%" + req.search + "%'";
    }
      sql.query(query, function (err, res) {
          if (err) {
            let error = {
              success: true,
              status:false,
          };
              result(error, null);
          }
          else {
              let resobj = {
                  success: true,
                  status:true,
                  result: res
              };
              result(null, resobj);
          }
      });
    }
  });
};

Moveituser.get_a_nearby_moveit_V2 = async function get_a_location_user(req, result) {
  var query= "select name,Vehicle_no,address,email,phoneno,userid,online_status from MoveitUser where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1";
  if (req.search) {
    query = query + " and name LIKE  '%" + req.search + "%'";
  }
  sql.query(query, function (err, res) {
    if (err) {
      let error = {
        success: true,
        status:false,
    };
        result(error, null);
    }
    else {
      if(res.length===0){
        let resobj = {
          success: true,
          status:false,
          message:"No Move-it found,please try after some time"
        };
        result(null, resobj);
      }else{
        MoveitFireBase.geoFireGetKeyByGeoMakeit(req.geoLocation,res,function(err, make_it_id) {
          if (err) {
            let error = {
              success: true,
              status:false,
              message:"No Move-it found,please after some time"
            };
            result(error, null);
          }else{
            let resobj = {
              success: true,
              status:true,
              result: make_it_id
            };
          result(null, resobj);
          }
        });
     }
        
    }
});
};


Moveituser.edit_moveit_user = function (req, result) {
    if (req.email || req.password || req.phoneno) {

        let sucobj = true;
        let message = "You can't to be Edit email / password/ phoneno";
        let resobj = {
            success: sucobj,
            message: message
        };

        result(null, resobj);
    } else {

         var staticquery = "UPDATE MoveitUser SET ";
         var column = '';
        for (const [key, value] of Object.entries(req)) {
            //  console.log(`${key} ${value}`); 

            if (key !== 'userid') {
                // var value = `=${value}`;
                column = column + key + "='" + value + "',";
            }


        }
       var query = staticquery + column.slice(0, -1) + " where userid = " + req.userid;
        //console.log(query);
        sql.query(query, function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            } else {
                let sucobj = true;
                let message = "Updated successfully"
                let resobj = {
                    success: sucobj,
                    status : true,
                    message: message
                };

                result(null, resobj);
            }

        });
    }
};


Moveituser.update_pushid = function(req, result) {
    var staticquery = "";
    if (req.pushid_android && req.userid) {
      staticquery =
        "UPDATE MoveitUser SET pushid_android ='" +
        req.pushid_android +
        "'   where userid = " +
        req.userid +
        " ";
    } else if (req.pushid_ios && req.userid) {
      staticquery =
        "UPDATE MoveitUser SET pushid_ios ='" +
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




  Moveituser.Moveituser_send_otp_byphone = function Moveituser_send_otp_byphone(newUser,result) {
    sql.query(
      "Select * from MoveitUser where phoneno = '" + newUser.phoneno + "'",
      function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          if (res.length == 0) {
            var OTP = Math.floor(Math.random() * 90000) + 10000;
  
            var otpurl =
            "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
            newUser.phoneno +
            "&senderId=EATHOM&message=Your EAT App OTP is " +
            OTP +
            ". Note: Please DO NOT SHARE this OTP with anyone.";
  
            
            console.log(otpurl);
            request({
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
                  sql.query("insert into Otp(phone_number,apptype,otp)values('" +newUser.phoneno +"',4,'" +OTP +"')",
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
                    message: responcecode[1]
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
              message: message,
              result:res
            };
  
            result(null, resobj);
          }
        }
      }
    );
  };
  
  
  
  Moveituser.Moveituser_otp_verification = function Moveituser_otp_verification( req,result) {
  
    sql.query("Select * from Otp where oid = '" + req.oid + "'", function( err,res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        //  console.log(res[0].otp);
        if (res[0].otp == req.otp) {
       
                  let resobj = {
                    success: true,
                    status: true,
                    message: "OTP verified successfully"
                  };
  
                  result(null, resobj);
                
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

  Moveituser.Moveituser_logout = async function Moveituser_logout(req, result) { 
    sql.query("select * from MoveitUser where userid = "+req.userid+" ",async function(err,userdetails) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
  
        console.log(req);
         
        if (userdetails.length !==0) {
          
          updatequery = await query("Update MoveitUser set pushid_android = 'null' where userid = '"+req.userid+"'");
  
  
          let resobj = {
            success: true,
             status: true,
            // message:mesobj,
            message: 'Logout Successfully!'  
          };
    
          result(null, resobj);
        }else{
  
          let resobj = {
            success: true,
             status: false,
            // message:mesobj,
            message: 'Please check userid'  
          };
    
          result(null, resobj);
        }     
      }
    });   
   
  };

module.exports = Moveituser;