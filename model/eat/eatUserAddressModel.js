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
  //  this.created_at = new Date();
    this.address_type = eatuseraddress.address_type;
    this.delete_status = eatuseraddress.delete_status || 0;
  
};



EatuserAddress.createUserAddress = function createUserAddress(new_address, result) {   
    
    sql.query("Select * from Address where userid = '"+new_address.userid+"' and  address_type = '"+new_address.address_type+"'", function (err, res) {
                
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{

        if (res.length === 0) {
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
                    message:mesobj,
                    aid: res.insertId
                    }; 
              
                 result(null, resobj);
                }
                }); 
                
        }else{
            
            new_address.address_type = 3;
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
                    message:mesobj,
                    aid: res.insertId
                    }; 
              
                 result(null, resobj);
                }
                }); 
                
        }

      
            
        }
    });
};



EatuserAddress.getaddressById = function getaddressById(userId, result) {
        sql.query("Select * from Address where userid = ? and delete_status = 0", userId, function (err, res) {             
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
        sql.query("Select * from Address", function (err, res) {

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

EatuserAddress.updateById = function(req, result){



  staticquery = "UPDATE Address SET updated_at = ?,";
        var column = '';
        for (const [key, value] of Object.entries(req)) {
            //  console.log(`${key} ${value}`); 

            if (key !== 'userid') {
                // var value = `=${value}`;
                column = column + key + "='" + value + "',";
            }
        }

      var  query = staticquery + column.slice(0, -1) + " where aid = " + req.aid;

      console.log(query);
    
        sql.query(query,[new Date()], function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {

                let sucobj = true;
                let message = "Updated successfully"
                let resobj = {
                    success: sucobj,
                    message: message
                };

                result(null, resobj);
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


EatuserAddress.update_delete_status = function(req, result){
    sql.query("UPDATE Address SET delete_status = 1 WHERE aid = ?", [req.aid], function (err, res) {
           if(err) {
        console.log("error: ", err);
        result(err, null);
           }
            else{
              let sucobj=true;
              message = 'Address removed sucessfully';
              let resobj = {  
             success: sucobj,
             message :message
        }; 
  
     result(null, resobj);
  
    }
  }); 
  };



  EatuserAddress.getaddressByaid = function getaddressByaid(aid, result) {
    sql.query("Select * from Address where aid = ? ",aid, function (err, res) {             
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


EatuserAddress.getaddressByadmin = function getaddressByadmin(req, result) {
    sql.query("Select * from Address where userid = 0", function (err, res) {             
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

module.exports = EatuserAddress;