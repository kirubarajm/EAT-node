'user strict';
var sql = require('../db.js');



//Task object constructor
var Makeituser = function(makeituser){
    this.name = makeituser.name;
    this.email = makeituser.email;
    this.phoneno = makeituser.phoneno;
    this.bank_account_no = makeituser.bank_account_no;
    this.verified_status=makeituser.verified_status;
    this.appointment_status=makeituser.appointment_status;
    this.referalcode = makeituser.referalcode;
    this.localityid = makeituser.localityid;
    this.lat = makeituser.lat;
    this.long = makeituser.long;
    this.password = makeituser.password;
    this.brandname = makeituser.brandname;
    this.created_at = new Date();
    this.bank_name = makeituser.bank_name;
    this.ifsc = makeituser.ifsc;
    this.bank_holder_name = makeituser.bank_holder_name;
    this.address = makeituser.address;
};

Makeituser.createUser = function createUser(newUser, result) {  

if(newUser.appointment_status==null)
    newUser.appointment_status=0;
        sql.query("INSERT INTO MakeitUser set ?", newUser, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                   // result(err, null);
                    returnResponse(400, false, "error",err);
                }
                else{
                    console.log(res.insertId);
                
                      returnResponse(200, true, "Registration Sucessfully", res.insertId,newUser);
                
                }
            });           

            function returnResponse(statusHttp, statusBool, message, data) {
                result({
                    statusHttp: statusHttp,
                    statusBool: statusBool,
                    message: message,
                    data: data,
                    newUser : newUser
                });
            }
  };


Makeituser.getUserById = function getUserById(userId, result) {
        sql.query("Select * from MakeitUser where userid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                   let sucobj=true;
                    let resobj = {  
                    success: sucobj,
                    result: res
                    }; 

                 result(null, resobj);
              
                }
            });   
};

Makeituser.getAllUser = function getAllUser(result) {
        sql.query("Select * from MakeitUser", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('User : ', res);  

                 let sucobj=true;
                    let resobj = {  
                    success: sucobj,
                    result: res
                    }; 

                 result(null, resobj);
                }
            });   
};


Makeituser.getAllUserByAppointment = function getAllUserByAppointment(result) {
        sql.query("Select * from MakeitUser where appointment_status=0 order by created_at DESC", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('User : ', res);  

                 let sucobj=true;
                    let resobj = {  
                    success: sucobj,
                    result: res
                    }; 

                 result(null, resobj);
                }
            });   
};



Makeituser.updateById = function(id, user, result){
  sql.query("UPDATE MakeitUser SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Makeituser.remove = function(id, result){
     sql.query("DELETE FROM MakeitUser WHERE userid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

Makeituser.checkLogin = function checkLogin(req, result) {
        var reqs = [req.email,req.password];
        sql.query("Select * from MakeitUser where email = ? and password = ?", reqs, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    
                    let resobj = {  
                    success: 'false',
                    result: err 
                    };
                    result(resobj, null);
                }
                else{
                    let sucobj=(res.length==1)?'true':'false';
                    let resobj = {  
                    success: sucobj,
                    result: res 
                    };
                    console.log("result: ---", res.length);
                    result(null, resobj);
                }
            });   
};

Makeituser.updatePaymentById = function(id, user, result){
    console.log(user);
  sql.query("UPDATE MakeitUser SET bank_name = ?, ifsc=?, bank_account_no=?, bank_holder_name=? WHERE userid = ?", [user.bank_name,user.ifsc,user.bank_account_no,user.bank_holder_name, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
               // result(null, err);
               returnResponse(400, false, "error", err);
             }
           else{   
             //result(null, res);
             returnResponse(200, true, "Payment Registration Sucessfully", res);
                }
            }); 

            function returnResponse(statusHttp, statusBool, message, data) {
                result({
                    statusHttp: statusHttp,
                    statusBool: statusBool,
                    message: message,
                    data: data
                });
            }
};

Makeituser.createAppointment = function createAppointment(req, result) {  

        sql.query("INSERT INTO Bookingtime (makeit_userid, date_time) values (?,?) ", [req.makeit_userid,req.date_time], function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    returnResponse(400, false, "error", err);
                }
                else{
                    console.log(res.insertId);
                   
                   returnResponse(200, true, "Appointment Created Sucessfully", res);
                }
            });   
            
            
            function returnResponse(statusHttp, statusBool, message, data) {
                result({
                    statusHttp: statusHttp,
                    statusBool: statusBool,
                    message: message,
                    data: data,
                });
            }
};







Makeituser.orderviewbymakeituser = function(id, result){
console.log(id.orderid); 

        var temp = [];
        sql.query("select ot.productid,pt.product_name,ot.quantity,ot.price,ot.gst,ot.created_at,ot.orderid from OrderItem ot left outer join Product pt on ot.productid = pt.productid where ot.orderid = '" + id.orderid +"'", function (err, res) {

         
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
            sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('User : ', responce); 
                  temp =  responce;
                  let sucobj=true;
                  let resobj = {  
                  success: sucobj,
                  res: res,
                  data : temp
                  }; 
      
               result(null, resobj);
                }   
            });
        
        }
    });  
};




Makeituser.orderlistbyuserid = function(id, result){
    
    sql.query("select * from Orders WHERE makeit_user_id  = '"+id+"' order by orderid desc", function (err, res) {

        
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          console.log('User : ', res);  

         let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
        }
    });  
};


Makeituser.orderstatusbyorderid = function(id, result){


    sql.query("UPDATE Orders SET orderstatus = ? WHERE orderid = ?", [id.orderstatusid, id.orderid], function (err, res) {
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{

         let sucobj=true;
         let mesobj="Status Update Sucessfully";
            let resobj = {  
            success: sucobj,
            message: mesobj,
            result: res
            }; 

         result(null, resobj);
        }
    });  
  };



module.exports= Makeituser;