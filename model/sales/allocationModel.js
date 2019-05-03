'user strict';
var sql = require('../db.js');
var Makeituser = require('../../model/makeit/makeitUserModel.js');

//Task object constructor
var Allocation = function(allocation){
    this.makeit_userid = allocation.makeit_userid;
    this.sales_emp_id=allocation.sales_emp_id;
    this.assign_date=allocation.assign_date;
    this.assignedby=allocation.assignedby;
    this.status=allocation.status;
   // this.created_at = new Date();
    this.booking_date_time = allocation.booking_date_time;
};


Allocation.createAllocation = function createAllocation(req, result) {    
        sql.query("INSERT INTO Allocation set ?", req, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    
                    sql.query("UPDATE MakeitUser SET appointment_status = 1 WHERE userid = ?", req.makeit_userid, function (err, res) {
                        if(err) {
                            console.log("error: ", err);
                            result(err, null);
                        } 
                    });  
                    
                    
                            let sucobj=true;
                            let message = "Booking time updated successfully";
                            let resobj = {  
                            success: sucobj,
                            message:message,
                            result: res.insertId 
                            }; 
                            result(null, resobj); 
                }
            });           
};


Allocation.updateAllocation = function updateAllocation(req, result) { 

    sql.query("update Allocation set sales_emp_id = ?, assignedby = ?, assign_date = ?, status = ? where makeit_userid = ?",[req.sales_emp_id,req.assignedby,new Date(),req.status,req.makeit_userid] , function (err, res) {
            
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                
                
                sql.query("UPDATE MakeitUser SET appointment_status = 2 WHERE userid = ?", req.makeit_userid, function (err, res) {
                    if(err) {
                        console.log("error: ", err);
                        result(err, null);
                    } else{
                        let sucobj=true;
                        let message = "Appointment assign successfully";
                        let resobj = {  
                        success: sucobj,
                        message:message
                        }; 
                        result(null, resobj);
                    }
                });   
            
            }
        });           
};





Allocation.getAllocationById = function getAllocationById(userId, result) {
        sql.query("Select * from Allocation where aid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
                }
            });   
};


Allocation.getAllocationBySalesEmpId = function getAllocationBySalesEmpId(userId, result) {
        sql.query("Select * from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = ? ", userId, function (err, res) {             
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


Allocation.getAllAllocation = function getAllAllocation(result) {
        sql.query("Select * from Allocation", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Allocation : ', res);  

                 result(null, res);
                }
            });   
};

Allocation.updateById = function(id, user, result){
  sql.query("UPDATE Allocation SET task = ? WHERE aid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Allocation.remove = function(id, result){
     sql.query("DELETE FROM Allocation WHERE aid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};


Allocation.update_a_followupstatus = function(req, result){

    
    sql.query("UPDATE Allocation SET status = ? WHERE makeit_userid = ? and sales_emp_id = ?" , [req.status,req.makeit_userid,req.sales_emp_id], function (err, res) {
            if(err) {
                console.log("error: ", err);
                  result(null, err);
               }
             else{
                var makeitfollowupstatus = new Makeituser(req);
                Makeituser.update_makeit_followup_status(makeitfollowupstatus, function (err, result) {
                    if (err)
                    result.send(err);
                    // res.json(result);
                }); 
                
                let sucobj=true;
                let mesobj = "Follow up status updated successfully";
                let resobj = {  
                success: sucobj,
                message:mesobj
                }; 
            
                    result(null, resobj);
                  }
              }); 
  };

module.exports= Allocation;