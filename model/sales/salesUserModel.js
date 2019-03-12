'user strict';
var sql = require('../db.js');

//Task object constructor
var Salesuser = function(salesuser){
    this.name = salesuser.name;
    this.email = salesuser.email;
    this.phoneno = salesuser.phoneno;
    this.address =salesuser.address;
    this.job_type =salesuser.job_type;
    this.referalcode = salesuser.referalcode;
    this.localityid = salesuser.localityid;
    this.password = salesuser.password;
    this.created_at = new Date();
};

Salesuser.createUser = function createUser(newUser, result) {    
        sql.query("INSERT INTO Sales_QA_employees set ?", newUser, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);                    
                    let sucobj='true';
                    let resobj = {  
                    success: sucobj,
                    result: res.insertId
                    };
                    result(null, resobj);
                }
            });           
};

Salesuser.getUserById = function getUserById(userId, result) {
        sql.query("Select * from Sales_QA_employees where id = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};

Salesuser.getAllUser = function getAllUser(result) {
        sql.query("Select * from Sales_QA_employees", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('User : ', res);  

                 result(null, res);
                }
            });   
};

Salesuser.updateById = function(id, user, result){
  sql.query("UPDATE Sales_QA_employees SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Salesuser.remove = function(id, result){
     sql.query("DELETE FROM Sales_QA_employees WHERE userid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

Salesuser.checkLogin = function checkLogin(req, result) {
        var reqs = [req.email,req.password];
        sql.query("Select * from Sales_QA_employees where email = ? and password = ?", reqs, function (err, res) {             
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


Salesuser.getAllsalesSearch = function getAllsalesSearch(req ,result) {
    
    
    var query = "Select * from Sales_QA_employees ";
    
    if(req.search && req.search !==''){
         query = query+" where name LIKE  '%"+req.search+"%'";
    }

    sql.query(query, function (err, res) {

            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
              console.log('User : ', res);  

             result(null, res);
            }
        });   
};


module.exports= Salesuser;