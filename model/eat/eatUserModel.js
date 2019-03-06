'user strict';
var sql = require('../db.js');

//Task object constructor
var Eatuser = function(eatuser){
    this.name = eatuser.name;
    this.email = eatuser.email;
    this.phoneno = eatuser.phoneno;
    this.referalcode = eatuser.referalcode;
    this.locality = eatuser.locality;
    this.password = eatuser.password;
    this.created_at = new Date();
};

Eatuser.createUser = function createUser(newUser, result) {    
        sql.query("INSERT INTO User set ?", newUser, function (err, res) {
                
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

Eatuser.getUserById = function getUserById(userId, result) {
        sql.query("Select * from User where userid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};

Eatuser.getAllUser = function getAllUser(result) {
        sql.query("Select * from User", function (err, res) {

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

Eatuser.updateById = function(id, user, result){
  sql.query("UPDATE User SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Eatuser.remove = function(id, result){
     sql.query("DELETE FROM User WHERE userid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

module.exports= Eatuser;