'user strict';
var sql = require('../db.js');

//Task object constructor
var Allocation = function(allocation){
    this.makeit_userid = allocation.makeit_userid;
    this.sales_emp_id=allocation.sales_emp_id;
    this.date=allocation.date;
    this.assignedby=allocation.assignedby;
    this.status=allocation.status;
    this.created_at = new Date();
};


Allocation.createAllocation = function createAllocation(newAllocation, result) {    
        sql.query("INSERT INTO Allocation set ?", newAllocation, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    
                    sql.query("UPDATE MakeitUser SET appointment_status = 1 WHERE userid = ?", newAllocation.makeit_userid, function (err, res) {
                    });
                    result(null, res.insertId);
                    
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

module.exports= Allocation;