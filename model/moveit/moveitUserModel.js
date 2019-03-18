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
               let sucobj=true;
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
        var reqs = [req.phoneno,req.password];
        sql.query("Select * from MoveitUser where phoneno = ? and password = ?", reqs, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    
                    let resobj = {  
                    success: 'false',
                    result: err 
                    };
                    result(resobj, null);
                }
                else{
                        len = res.length;
                    console.log(len);
                    let sucobj=(res.length !==0)?'true':'false';
                    let resobj = {  
                    success: sucobj,
                    result: res 
                    };
                    console.log("result: ---", res.length);
                    result(null, resobj);
                }
            });   
};





Moveituser.getAllmoveitSearch = function getAllmoveitSearch(req ,result) {
    
    
    var query = "Select * from MoveitUser";
    
    if(req.search && req.search !==''){
         query = query+" where name LIKE  '%"+req.search+"%'";
    }

    sql.query(query, function (err, res) {

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



Moveituser.update_online_status = function(req, result){

    console.log(req);
    sql.query("UPDATE MoveitUser SET online_status = ? WHERE userid = ?", [req.online_status, req.userid], function (err, res) {
           
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            if(req.online_status == 1){
                key = "Moved online";
            }else{
                key = "Moved offline";
            }
           let sucobj=true;
           let message = key;
            let resobj = {  
            success: sucobj,
            message:message
            }; 

         result(null, resobj);
        }
    }); 
  };


module.exports= Moveituser;