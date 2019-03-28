'user strict';
var sql = require('../db.js');

//Task object constructor
var EatuserAddress = function(eatuseraddress){
    this.userid = eatuseraddress.userid;
    this.address_title = eatuseraddress.address_title;
    this.address = eatuseraddress.address;
    this.flatno = eatuseraddress.flatno;
    this.locality = eatuseraddress.locality;
    this.pincode = eatuseraddress.pincode;
    this.lat = eatuseraddress.lat;
    this.lon = eatuseraddress.lon;
    this.landmark = eatuseraddress.landmark;
    this.created_at = new Date();
};



EatuserAddress.createUserAddress = function createUserAddress(new_address, result) {   
    
        sql.query("INSERT INTO Address set ?", new_address, function (err, res) {
                
            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
              let sucobj=true;
              let mesobj = "EatUser Address Created successfully";
              let resobj = {  
                success: sucobj,
                message:mesobj
                }; 
          
             result(null, resobj);
            }
            });              
};



EatuserAddress.getaddressById = function getaddressById(userId, result) {
        sql.query("Select * from Address where userid = ? ", userId, function (err, res) {             
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

EatuserAddress.getAllAddress = function getAllAddress(result) {
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

EatuserAddress.updateById = function(id, user, result){
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

EatuserAddress.remove = function(id, result){
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


module.exports = EatuserAddress;