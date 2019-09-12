'user strict';
var sql = require('../db.js');
var request = require("request");
var Documentmoveit = require('../../model/common/documentsMoveitModel.js');
var MoveitFireBase =require("../../push/Moveit_SendNotification")
var Constant =require("../constant")
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var constant = require('../constant.js');
var MoveitTimelog = require("../../model/moveit/moveitTimeModel");
var moment = require("moment");

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


                   
                        let resobj = {
                            success: true,
                            status :true,
                            message: 'Moveit user created successfully',
                            id: res.insertId

                        };

                        result(null, resobj);

                    }
                });
            } else {

              
                let message = "Following user already Exist! Please check it mobile number / email";
                let resobj = {
                    success: true,
                    status : false,
                    message: message
                };

                result(null, resobj);
            }
        }
    });
};

Moveituser.getUserById = function getUserById(userId, result) {
    sql.query("Select userid,name,email,bank_account_no,phoneno,Vehicle_no,verified_status,online_status,referalcode,localityid,bank_name,ifsc,bank_holder_name,moveit_hub,driver_lic,vech_insurance,vech_rcbook,photo,legal_document,branch,pushid_android,address,pushid_ios From MoveitUser where userid = ? ", userId, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            
            let resobj = {
                success: true,
                status :true,
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
    sql.query("Select * from MoveitUser where phoneno = ? and password = ?", reqs,async function (err, res) {
        if (err) {
            console.log("error: ", err);

            let resobj = {
                success: false,
                status : false,
                result: err
            };
            result(resobj, null);
        }
        else {
            
             if (res.length !== 0) {
              

              if (res[0].login_status === 3) {
                let resobj = {
                  success: true,
                  status : false,
                  message : "Please contact administrator!",
                  
                 };
              result(null, resobj);
              }else{

                var logintime =  moment().format("YYYY-MM-DD HH:mm:ss");

                updateloginstatus = await query("update MoveitUser set login_status = 1 ,login_time='"+logintime+"' where userid = "+res[0].userid+" ");
                
                let token = jwt.sign({username: req.phoneno},
                  config.secret
                  // ,
                  // { //expiresIn: '24h' // expires in 24 hours
                  // }
                 );
  
                 console.log("login");
                 let resobj = {
                  success: true,
                  status : true,
                  token :token,
                  result: res
                 };
              result(null, resobj);

              }
             
            }else{
            let resobj = {
              success: true,
              status : false,
              message : "Please check your username and password",
              
             };
          result(null, resobj);
          }
           
        }
    });
};

Moveituser.getAllmoveitSearch = function getAllmoveitSearch(req, result) {
    var query = "Select * from MoveitUser as mov";
    if(req.online_status===0){
      query = query + " where mov.online_status=" +req.online_status
      if (req.search) {
        query = query + " and mov.name LIKE  '%" + req.search + "%'";
      }
    }else if(req.online_status===1){
      query= "select * from MoveitUser where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1";
      if (req.search) {
        query = query + " and name LIKE  '%" + req.search + "%'";
      }
    }else if(req.online_status===-2){
      query= "select * from MoveitUser where userid IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1";
      if (req.search) {
        query = query + " and name LIKE  '%" + req.search + "%'";
      }
    }else if (req.search) {
      query = query + " where mov.name LIKE  '%" + req.search + "%'";
    } 
    sql.query(query, function (err, res) {
        if (err) {
            result(err, null);
        }else{
          let resobj = {
              success: true,
              status:true,
              result: res
          };
        result(null, resobj);
        }
    });
};


Moveituser.create_createMoveitTimelog = function create_createMoveitTimelog(req) {
  var new_MoveitTimelog = new MoveitTimelog(req);
    MoveitTimelog.createMoveitTimelog(new_MoveitTimelog, function(err, new_MoveitTimelog) {
      if (err) return err;
      else return new_MoveitTimelog;
     
    });
 
};


Moveituser.update_online_status =async function (req, result) {

var userdetails = await query("select * from MoveitUser where userid = "+req.userid+"");

  if (userdetails.length !==0) {
    
  if (userdetails[0].login_status == 1) {
        
    var orderdetails = await query("select * from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE() and moveit_user_id = "+req.userid+"");

    if (orderdetails.length == 0) {
    sql.query("UPDATE MoveitUser SET online_status = ? WHERE userid = ?", [req.online_status, req.userid],async function (err, res) {

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
            req.type =req.online_status;
            req.moveit_userid =req.userid;
            await Moveituser.create_createMoveitTimelog(req);

            // let message = key;
            // let onlinestatus = key1;
            let resobj = {
                success: true,
                status:true,
                message: key,
                onlinestatus: key1,
                forcelogout : 1
            };

            result(null, resobj);
        }
    });
  }else{
    let resobj = {
      success: true,
       status: false,
       forcelogout : 1, 
       onlinestatus : true,
      // message:mesobj,
      message: "Sorry you can't go offline, Orders is assigned to you!"  
    };

    result(null, resobj);
  }
 
  }else if(userdetails[0].login_status == 2){
    let resobj = {
      success: true,
      status: false,
      forcelogout : 2,
      onlinestatus : false,
      message: "Please login"
  };

  result(null, resobj);
  }else if(userdetails[0].login_status == 3){
    let resobj = {
      success: true,
      status: false,
      forcelogout : 3,
      onlinestatus : false,
      message: "Please contact Administrator"
  };

  result(null, resobj);
  }
  }else{
    
    let resobj = {
        success: true,
        status: false,
        message: "User not found!"
    };

    result(null, resobj);
  }
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
        
  
          let resobj = {
            success: true,
            status: false,
            message: "OTP is not valid!, Try once again"
          };
  
          result(null, resobj);
        }
      }
    });
  };

  Moveituser.Moveituser_logout = async function Moveituser_logout(req, result) { 

    var orderdetails = await query("select * from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE() and moveit_user_id = "+req.userid+"");

    if (orderdetails.length == 0) {
      
    sql.query("select * from MoveitUser where userid = "+req.userid+" ",async function(err,userdetails) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
  
          
        if (userdetails.length !==0) {
          
          var logouttime =  moment().format("YYYY-MM-DD HH:mm:ss");

          updatequery = await query("Update MoveitUser set online_status = 0,pushid_android = 'null',login_status = 2,logout_time='"+logouttime+"'  where userid = '"+req.userid+"'");
          
  
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

  }else{
    let resobj = {
      success: true,
       status: false,
      // message:mesobj,
      message: "Sorry yoy can't logout , Currently Order is assigned to you!"  
    };

    result(null, resobj);
  }
   
  };


  Moveituser.admin_force_Moveituser_logout = async function admin_force_Moveituser_logout(req, result) { 

    orderdetails = await query("select * from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE() and moveit_user_id = "+req.userid+"");

    if (orderdetails.length == 0) {
      
    
    sql.query("select * from MoveitUser where userid = "+req.userid+" ",async function(err,userdetails) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
  
          
        if (userdetails.length !==0) {
          
          var logouttime =  moment().format("YYYY-MM-DD HH:mm:ss");
         
          updatequery = await query("Update MoveitUser set online_status = 0,pushid_android = 'null',login_status = "+req.login_status+",logout_time='"+logouttime+"'  where userid = '"+req.userid+"'");
         
        
  
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
  }else{
    let resobj = {
      success: true,
       status: false,
      // message:mesobj,
      message: "Sorry can't logout, Order is assigned following user!"  
    };

    result(null, resobj);
  }
  };

  Moveituser.moveit_app_version_check_vid= async function moveit_app_version_check_vid(req,result) { 
 
    var updatestatus = {};
    var versionstatus = false;
    var moveitforceupdatestatus =false;

    var moveitversioncode = constant.moveitversioncode;
    var moveitforceupdate = constant.moveitforceupdate;
    

    // if (req.moveitversioncode < moveitversioncode) {
      
    //   versionstatus = true;
    //   moveitforceupdatestatus = true;
    // }

    if (req.moveitversioncode < constant.moveitversionforceupdate) {
        
      versionstatus = true;
      moveitforceupdatestatus = true;
    }else if(req.moveitversioncode < constant.moveitversioncodenew){
      versionstatus = true;
      moveitforceupdatestatus = false;
    }else{
      versionstatus = false;
      moveitforceupdatestatus = false;
    }



    updatestatus.versionstatus = versionstatus;
    updatestatus.moveitforceupdatestatus = moveitforceupdatestatus;

        let resobj = {
            success: true,
            status:true,
            result:updatestatus
        };
  
        result(null, resobj);

  
  };


  Moveituser.moveit_online_status_byid= async function moveit_online_status_byid(req,result) { 
 
 var Moveitstatus = await query("select userid,login_status,pushid_ios,pushid_android  from MoveitUser where userid = "+req.userid+" ");

    if (Moveitstatus.length !==0) {
      let resobj = {
        success: true,
        status:true,
        result:Moveitstatus
    };

    result(null, resobj);

    }else{
      let resobj = {
        success: true,
        status: false,
        result:Moveitstatus
    };

    result(null, resobj);
    }
       
  
  };
module.exports = Moveituser;