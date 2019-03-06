'user strict';
var sql = require('../db.js');

//Task object constructor
var Moveituser = function(moveituser){
    this.name = moveituser.name;
    this.email = moveituser.email;
    this.phoneno = moveituser.phoneno;
    this.bank_account_no = moveituser.bank_account_no;
    this.vehicle_no= moveituser.vehicle_no;
    this.verified_status=moveituser.verified_status;
    this.online_status=moveituser.online_status;
    this.referalcode = moveituser.referalcode;
    this.localityid = moveituser.localityid;
    this.password = moveituser.password;
    this.created_at = new Date();
    
};

Moveituser.createUser = function createUser(newUser, result) {    
        sql.query("INSERT INTO MoveitUser set ?", newUser, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    result(null, res.insertId);
                }
            });           
};

Moveituser.getUserById = function getUserById(userId, result) {
        sql.query("Select * from MoveitUser where userid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};

Moveituser.getAllUser = function getAllUser(result) {
        sql.query("Select * from MoveitUser", function (err, res) {

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

Moveituser.updateById = function(id, user, result){
  sql.query("UPDATE MoveitUser SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Moveituser.remove = function(id, result){
     sql.query("DELETE FROM MoveitUser WHERE userid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

Moveituser.checkLogin = function checkLogin(req, result) {
        var reqs = [req.email,req.password];
        sql.query("Select * from MoveitUser where email = ? and password = ?", reqs, function (err, res) {             
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

module.exports= Moveituser;