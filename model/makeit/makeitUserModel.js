'user strict';
var sql = require('../db.js');



//Task object constructor
var Makeituser = function(makeituser){
    this.name = makeituser.name;
    this.email = makeituser.email;
    this.phoneno = makeituser.phoneno;
    this.bank_account_no = makeituser.bank_account_no;
    this.verified_status=makeituser.verified_status || '0';
    this.appointment_status=makeituser.appointment_status;
    this.referalcode = makeituser.referalcode;
    this.localityid = makeituser.localityid;
    this.lat = makeituser.lat;
    this.lon = makeituser.lon;
    this.password = makeituser.password;
    this.brandname = makeituser.brandname;
    this.created_at = new Date();
    this.bank_name = makeituser.bank_name;
    this.ifsc = makeituser.ifsc;
    this.bank_holder_name = makeituser.bank_holder_name;
    this.address = makeituser.address;
    this.virtualkey = makeituser.virtualkey || 0;
    this.img = makeituser.img;
};

Makeituser.createUser = function createUser(newUser, result) {  

if(newUser.appointment_status==null)
    newUser.appointment_status=0;


    sql.query("Select * from MakeitUser where phoneno = '"+newUser.phoneno+"' OR email= '"+newUser.email+"' " , function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
              
               if(res.length == 0){
            sql.query("INSERT INTO MakeitUser set ?", newUser, function (err, res1) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }else{
               
                sql.query("Select userid,name,email,bank_account_no,phoneno,appointment_status from MakeitUser where userid = ? ", res1.insertId, function (err, res) {             
                    if(err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else{
                       let sucobj=true;
                       let message = "Registration Sucessfully";
                        let resobj = {  
                        success: sucobj,
                        message:message,
                        result: res
                        }; 
    
                     result(null, resobj);
                  
                    }
                });  
            }
         });
        }else{

                     let sucobj=true;
                       let message = "Following user already Exist! Please check it mobile number / email" ;
                        let resobj = {  
                        success: sucobj,
                        message:message
                        }; 
    
                     result(null, resobj);

        }
      
        }
    });              
  };


Makeituser.getUserById = function getUserById(userId, result) {
  

    //var query1 = "select mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey from MakeitUser as mu join Documents_Sales as ds on mu.userid = ds.makeit_userid join Documents as st on ds.docid = st.docid where mu.userid = '"+userId+"'";
        var query1 = "Select * from MakeitUser where userid = '"+userId+"'";
        sql.query(query1, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{

                    sql.query("select st.url,st.docid,st.type from Documents_Sales as ds join Documents as st on ds.docid = st.docid where ds.makeit_userid = '"+userId+"'", function (err, images) {

                        if(err) {
                            console.log("error: ", err);
                            result(null, err);
                        }
                        else{
                            res[0].gallery = images;   
                            let sucobj=true;
                            let resobj = {  
                            success: sucobj,
                            result: res,
                            }; 
                            
                         result(null, resobj);
                        }
                    }); 

                
    
              
                }
            });   
};




Makeituser.getAllUser = function getAllUser(result) {
       sql.query("Select * from MakeitUser", function (err, res) {
   
       // sql.query("select concat('[',GROUP_CONCAT(CONCAT('{"url :"', st.url,'"}')),']') url ,mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey  from MakeitUser as mu join Documents_Sales as ds on mu.userid = ds.makeit_userid join Documents as st on ds.docid = st.docid where mu.userid = 1 group by mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey ", function (err, res) {
      //  sql.query("SELECT JSON_OBJECT('Orderid', ci.orderid,'Item', JSON_ARRAYAGG(JSON_OBJECT('Quantity', ci.quantity,'Productid', ci.productid))) AS ordata FROM Orders co JOIN OrderItem ci ON ci.orderid = co.orderid GROUP BY co.orderid", function (err, res) {
                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                // res=  JSON.stringify(res);
                for (let i = 0; i < res.length; i++) {
                   
                    res[i]=  JSON.parse(res[i].ordata);
                    
                }
                

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
   
      //  sql.query("Select * from MakeitUser where appointment_status=1 order by created_at DESC", function (err, res) {
        sql.query(" Select * from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid where mu.appointment_status = 1", function (err, res) {
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
        var reqs = [req.phoneno,req.password];
        sql.query("Select * from MakeitUser where phoneno = ? and password = ?", reqs, function (err, res) {             
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
                    result: data
                });
            }
};

Makeituser.createAppointment = function createAppointment(req, result) {  

        sql.query("INSERT INTO Bookingtime (makeit_userid, date_time) values (?,?) ", [req.makeit_userid,req.date_time], function (err, res) {
                
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
                else{
                   
                    sql.query("UPDATE MakeitUser SET appointment_status = 1 WHERE userid = ?",req.makeit_userid, function (err, res) {
                        if(err) {
                            console.log("error: ", err);    
                            result(err, null);
                        }
                        
                   sql.query("Select userid,name,email,bank_account_no,phoneno,appointment_status from MakeitUser where userid = ? ", req.makeit_userid, function (err, res) {             
                    if(err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else{
                       let sucobj=true;
                       let message = "Appointment Created Sucessfully";
                        let resobj = {  
                        success: sucobj,
                        message:message,
                        result: res
                        }; 
    
                     result(null, resobj);
                  
                    }
                }); 
            });    
            }
            });   
            
            
           
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
           // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
             sql.query("select * from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
         
                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  
                  temp =  responce;
                  let sucobj=true;
                  let resobj = {  
                  success: sucobj,
                  result: res,
                  data : temp
                  }; 
      
                 result(null, resobj);
                }   
            });
        
        }
    });  
};




Makeituser.orderlistbyuserid = function(id, result){
    console.log(id);
    if(id){
    var query = "select * from Orders WHERE makeit_user_id  = '"+id+"' order by orderid desc";
    }else{
    var query = "select * from Orders order by orderid desc";
    }
    
    sql.query(query, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          console.log('Product : ', res);  
          let sucobj=true;
          let resobj = {  
            success: sucobj,
            result: res 
            }; 

         result(null, resobj);
        }
    }); 
};


Makeituser.all_order_list = function(result){
    
    var query = "select * from Orders order by orderid desc";

        
    sql.query(query, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(null, err);
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


Makeituser.all_order_list_bydate = function(req,result){
    
        console.log(req.body);
    sql.query("select * from Orders WHERE ordertime BETWEEN '"+req.startdate+"' AND '"+req.enddate+"' order by orderid desc", function (err, res) {

        
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



  Makeituser.get_admin_list_all_makeitusers = function(req, result){
   
   req.appointment_status = ""+req.appointment_status 
   
   req.virtualkey = ""+req.virtualkey 
//    rsearch = req.search || ''

    var query = "select * from MakeitUser";
   
    var searchquery = "name LIKE  '%"+req.search+"%'";

    if(req.appointment_status !=='all' && req.virtualkey !=='all' && !req.search){

         query = query+" WHERE appointment_status  = '"+req.appointment_status+"' and virtualkey  = '"+req.virtualkey+"'";

    }else if(req.virtualkey !=='all' && !req.search){

         query = query+" WHERE virtualkey  = '"+req.virtualkey+"'";

    }else if(req.appointment_status !=='all' && !req.search){

        query = query+" WHERE appointment_status  = '"+req.appointment_status+"'";

   }else if(req.appointment_status !=='all' && req.virtualkey !=='all' && req.search){

         query = query+" WHERE appointment_status  = '"+req.appointment_status+"' and virtualkey  = '"+req.virtualkey+"' and "+searchquery;

    }else if(req.virtualkey !=='all' && req.search){

         query = query+" WHERE virtualkey  = '"+req.virtualkey+"'and "+searchquery;

    }else if(req.appointment_status !=='all' && req.search){

        query = query+" WHERE appointment_status  = '"+req.appointment_status+"'and "+searchquery;

    }else if(req.search){
            query = query+" where " +searchquery
        }



    // if(req.appointment_status !== 'all'){
    //      query = query+" WHERE appointment_status  = '"+req.appointment_status+"' ";
    // }


    // if(req.virtualid !== 'all' && req.search){
    //     query = query+" and ("+searchquery+")"
    // }else if(req.appointment_status !== 'all' && req.search){
    //     query = query+" and ("+searchquery+")"
    // }else if(req.search){
    //     query = query+" where " +searchquery
    // }


    sql.query(query, function (err, res) {


        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          console.log('Product : ', res);  
          let sucobj=true;
          let resobj = {  
            success: sucobj,
            result: res
           
            }; 

         result(null, resobj);
        }
    }); 
};



Makeituser.updatemakeit_user_approval = function(req, result){
    
    sql.query("UPDATE MakeitUser SET appointment_status = 3 ,verified_status = '"+req.verified_status+"' WHERE userid = ?",req.makeit_userid, function (err, res) {
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          let sucobj=true;
          let message = "Makeit user verify status updated";
          let resobj = {  
            success: sucobj,
            message:message,
            //result: res 
            }; 

         result(null, resobj);
        }
    
    }); 

           
};



Makeituser.update_makeit_followup_status = function(makeitfollowupstatus, result){
    sql.query("UPDATE MakeitUser SET appointment_status = ? WHERE makeit_userid = ? " , [makeitfollowupstatus.status,makeitfollowupstatus.makeit_userid], function (err, res) {
            if(err) {
                console.log("error: ", err);
                  result(null, err);
               }
             
              }); 
  };

module.exports= Makeituser;