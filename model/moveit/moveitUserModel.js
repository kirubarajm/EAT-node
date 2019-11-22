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
              status: true,
              result: make_it_id
            };
          result(null, resobj);
          }
        });
     }
        
    }
});
};

Moveituser.admin_moveit_current_location = async function admin_moveit_current_location(req, result) {
  var query= "select mou.name,mou.zone,mou.Vehicle_no,mou.address,mou.email,mou.phoneno,mou.userid,mou.online_status,mou.moveit_hub,mkh.color,mkh.address as mkhaddress from MoveitUser mou join Makeit_hubs as mkh on mkh.makeithub_id=mou.moveit_hub where mou.online_status = 1";
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
        MoveitFireBase.geoFireGetMoveitLocation(res,function(err, make_it_id) {
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
              status: true,
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
          var logoutstatusMessage='Force logout and disable Successfully!'
          if(req.login_status===3) logoutstatusMessage= 'Enable Successfully.Please login after use.'
  
          let resobj = {
            success: true,
             status: true,
            message: logoutstatusMessage  
          };
    
          result(null, resobj);
        }else{
  
          let resobj = {
            success: true,
             status: false,
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
 
 var Moveitstatus = await query("select userid,online_status,login_status,pushid_ios,pushid_android  from MoveitUser where userid = "+req.userid+" ");

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

  //Moveit Customer Support
  Moveituser.moveit_app_customer_support= async function moveit_app_customer_support(req,result) { 
    let resobj = {
        success: true,
        status:true,
        customer_support : constant.moveit_customer_support
    };
    result(null, resobj);
  };

  Moveituser.getNearByMoveit_auto_assign_moveit_V2 = async function getNearByMoveit_auto_assign_moveit_V2(req, result) {

    var geoLocation = [];;
    geoLocation.push(req.lat);
    geoLocation.push(req.lon);
  
    MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(geoLocation,Constant.nearby_moveit_radius,async function(err, move_it_id) {
      if (err) {
        let error = {
          success: true,
          status:false,
          message:"No Move-it found,please after some time"
        };
        result(error, null);
      }else{
   
      
       // console.log("test3"+move_it_id);
        let resobj = {
          success: true,
          status: true,
          result: move_it_id
        };
      result(null, resobj);
      }
    })
  };

////////////Get Working Dates
Moveituser.getworking_dates = async function getworking_dates(req, result) {
  var getdates = await query("select moveit_userid as moveit_id,date(logtime) as date,0 as TotalOrders,0 as CompletedOrders,0 as InCompletedOrders, '00:00:00' as AvgAcceptTime, '00:00:00' as AvgDeliveryTime,'00:00:00' as AvgKitchenReachTime,'00:00:00' as AvgOrderTime from Moveit_Timelog where moveit_userid="+req.moveit_id+" group by date(logtime) desc");

  for(var i=0; i<getdates.length; i++){
    requestdata = {"moveit_id":getdates[i].moveit_id,"date":getdates[i].date};
    await Moveituser.daywise_moveit_records(requestdata, async function(err, res) {
      if (err) {
        //result(err, null);
        console.log(err);
      } else {
        console.log(res);
        getdates[i].TotalOrders         = res.TotalOrders;
        getdates[i].CompletedOrders     = res.CompletedOrders;
        getdates[i].InCompletedOrders   = res.InCompletedOrders;
        getdates[i].AvgAcceptTime       = res.AvgAcceptTime;
        getdates[i].AvgDeliveryTime     = res.AvgDeliveryTime;
        getdates[i].AvgKitchenReachTime = res.AvgKitchenReachTime;
        getdates[i].AvgOrderTime        = res.AvgOrderTime;
      } 
    });
  } 

  if(getdates.length>0){
    let resobj = {
      success: true,
      status : true,
      result : getdates
    };
    result(null, resobj);
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status : false
    };
    result(null, resobj);
  }
};

////////////Day Wise Moveit History
  Moveituser.daywise_moveit_records = async function daywise_moveit_records(req, result) {
    //console.log(req);
    var getorderlist = await query("select mu.userid,ord.orderid,ord.ordertime,time(ord.order_assigned_time) as order_assigned_time,time(ord.moveit_notification_time) as moveit_notification_time,time(ord.moveit_accept_time) as moveit_accept_time,time(ord.moveit_reached_time) as moveit_reached_time,time(ord.moveit_pickup_time) as moveit_pickup_time,time(ord.moveit_expected_delivered_time) as moveit_expected_delivered_time,time(ord.moveit_customerlocation_reached_time) as moveit_customerlocation_reached_time,time(ord.moveit_actual_delivered_time) as moveit_actual_delivered_time,ord.moveit_status,CASE WHEN ord.orderstatus=0 then 'Order put' WHEN ord.orderstatus=1 then 'Order Accept' WHEN ord.orderstatus=2 then 'Order Preparing' WHEN ord.orderstatus=3 then 'Order Prepared' WHEN ord.orderstatus=4 then 'Kitchen reached' WHEN ord.orderstatus=5 then 'Order Pickedup' WHEN ord.orderstatus=6 then 'Order Delivered' WHEN ord.orderstatus=7 then 'Order Cancel' WHEN ord.orderstatus=8 then 'Order missed by kitchen' WHEN ord.orderstatus=9 then 'Incomplete online order reject' END as status,ord.orderstatus,TIMEDIFF(time(ord.moveit_accept_time),time(ord.order_assigned_time)) as avg_accept_time,TIMEDIFF(time(ord.moveit_actual_delivered_time),time(ord.moveit_pickup_time)) as avg_delivery_time,TIMEDIFF(time(ord.moveit_reached_time),time(ord.moveit_accept_time)) as avg_kitchen_reach_time,TIMEDIFF(time(ord.moveit_actual_delivered_time),time(ord.order_assigned_time)) as avg_order_time,ord.cus_lat,ord.cus_lon,mau.lat,mau.lon,ord.distance_makeit_to_eat from MoveitUser as mu left join Orders as ord on ord.moveit_user_id=mu.userid left join MakeitUser as mau on mau.userid=ord.makeit_user_id where ord.moveit_user_id="+req.moveit_id+" and date(ord.ordertime)='"+req.date+"' order by ord.orderid desc");
       
    var TotalOrders         = 0;
    var CompletedOrders     = 0;
    var InCompletedOrders   = 0;
    var AvgAcceptTime       = "00:00:00";
    var AvgDeliveryTime     = "00:00:00";
    var AvgKitchenReachTime = "00:00:00";
    var AvgOrderTime        = "00:00:00";
    var DistanceMitter   = 0;
    var AvgDistance         = 0;

    for(var i=0; i<getorderlist.length; i++){
      ////Total Orders Calculation
      TotalOrders = TotalOrders+1;
      ////Completed and InCompleted Order Calculation
      if(getorderlist[i].orderstatus == 6){
        CompletedOrders   = CompletedOrders+1;
      }else{
        InCompletedOrders = InCompletedOrders+1;
      }
      ////Sum Accept Time Calculation
      var aahms         = getorderlist[i].avg_accept_time || "00:00:00";   
      var aaa           = aahms.split(':'); 
      var aaseconds     = (+aaa[0]) * 60 * 60 + (+aaa[1]) * 60 + (+aaa[2]); 
      AvgAcceptTime = moment(AvgAcceptTime, 'HH:mm:ss').add(aaseconds,'s').format('HH:mm:ss');
      ////Sum Delivery Time Calculation
      var adhms         = getorderlist[i].avg_delivery_time || "00:00:00";   
      var ada           = adhms.split(':'); 
      var adseconds     = (+ada[0]) * 60 * 60 + (+ada[1]) * 60 + (+ada[2]); 
      AvgDeliveryTime = moment(AvgDeliveryTime, 'HH:mm:ss').add(adseconds,'s').format('HH:mm:ss');
      ////Sum Kitchen Reached Time Calculation
      var akhms         = getorderlist[i].avg_kitchen_reach_time || "00:00:00";   
      var aka           = akhms.split(':'); 
      var akseconds     = (+aka[0]) * 60 * 60 + (+aka[1]) * 60 + (+aka[2]); 
      var AvgKitchenReachTime = moment(AvgKitchenReachTime, 'HH:mm:ss').add(akseconds,'s').format('HH:mm:ss');
      ////Sum Order Time Calculation
      var aohms         = getorderlist[i].avg_order_time || "00:00:00";   
      var aoa           = aohms.split(':'); 
      var aoseconds     = (+aoa[0]) * 60 * 60 + (+aoa[1]) * 60 + (+aoa[2]); 
      AvgOrderTime  = moment(AvgOrderTime, 'HH:mm:ss').add(aoseconds,'s').format('HH:mm:ss');

      ////Sum Calculation 
      DistanceMitter = DistanceMitter+parseFloat(getorderlist[i].distance_makeit_to_eat || 0);
      getorderlist[i].distance_makeit_to_eat = (parseFloat(getorderlist[i].distance_makeit_to_eat)/1000.0 || 0).toFixed(2);
      
    }
    ////Average Accept Time Calculation
    var AATS      = AvgAcceptTime || "00:00:00";  
    var AATSec    = moment(AATS, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
    var AATimesec = AATSec/getorderlist.length;
    AvgAcceptTime = moment().startOf('day').seconds(AATimesec).format('H:mm:ss');
    ////Average Delivery Time Calculation
    var ADTS      = AvgDeliveryTime || "00:00:00";  
    var ADTSec    = moment(ADTS, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
    var ADTimesec = ADTSec/getorderlist.length;
    AvgDeliveryTime  = moment().startOf('day').seconds(ADTimesec).format('H:mm:ss');
    ////Average Kitchen Reached Time Calculation
    var AkTS      = AvgKitchenReachTime || "00:00:00";  
    var AkTSec    = moment(AkTS, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
    var AkTimesec = AkTSec/getorderlist.length;
    AvgKitchenReachTime  = moment().startOf('day').seconds(AkTimesec).format('H:mm:ss');
    ////Average Order Time Calculation
    var AOTS      = AvgOrderTime || "00:00:00";  
    var AOTSec    = moment(AOTS, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
    var AOTimesec = AOTSec/getorderlist.length;
    AvgOrderTime  = moment().startOf('day').seconds(AOTimesec).format('H:mm:ss');
    ////Average Distance calculation
    DistanceMitter = DistanceMitter/getorderlist.length;
    AvgDistance    = DistanceMitter/1000.0;

    if(getorderlist.length>0){
      let resobj = {
        success: true,
        status : true,
        TotalOrders       : TotalOrders,
        CompletedOrders   : CompletedOrders,
        InCompletedOrders : InCompletedOrders,
        AvgAcceptTime     : AvgAcceptTime,
        AvgDeliveryTime   : AvgDeliveryTime,
        AvgKitchenReachTime:AvgKitchenReachTime,
        AvgOrderTime      : AvgOrderTime,
        AvgDistance       : AvgDistance.toFixed(2),
        result : getorderlist,
      };
     
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        message: "Sorry! no data found.",
        status : false
      };
      result(null, resobj);
    }
  };
  

  Moveituser.check_map_boundaries = function check_map_boundaries(req,result) {
    //console.log(req);
    sql.query("Select * from Zone", function( err,res) {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        console.log(res);
        var isZone=false;
        var zoneName='';
        if(res.length>0){
          for(var i=0; i<res.length; i++){
            var polygon=JSON.parse(res[i].boundaries);
            if(Moveituser.pointInPolygon(polygon,{lat:req.lat,lng:req.lng})){
              zoneName=res[i].Zonename;
              isZone=true;
              break;
            }
          }
          
        }
        if(isZone){
          let resobj = {
            success: true,
            status : true,
            message: zoneName,
            zone_id:res[i].id
          };
          result(null, resobj);
        }else{
          let resobj = {
            success: true,
            status : true,
            message: 'No Zone Available.'
          };
          result(null, resobj);
        }
      }
    });
  };

  Moveituser.pointInPolygon=function pointInPolygon(polygonPath, coordinates){
    let numberOfVertexs = polygonPath.length - 1;
    let inPoly = false;
    let { lat, lng } = coordinates;

    let lastVertex = polygonPath[numberOfVertexs];
    let vertex1, vertex2;

    let x = lat, y = lng;

    let inside = false;
    for (var i = 0, j = polygonPath.length - 1; i < polygonPath.length; j = i++) {
        let xi = polygonPath[i].lat, yi = polygonPath[i].lng;
        let xj = polygonPath[j].lat, yj = polygonPath[j].lng;

        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}
module.exports = Moveituser;