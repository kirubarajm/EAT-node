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
    this.virutal= eatuser.virutal;
};

Eatuser.createUser = function createUser(newUser, result) {   
    
    if(newUser.virutal==null)
    newUser.virutal=0;
        sql.query("INSERT INTO User set ?", newUser, function (err, res) {
                
            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
              let sucobj=true;
              let mesobj = "Virtual User Created successfully";
              let resobj = {  
                success: sucobj,
                message:mesobj,
                userid: res.insertId 
                }; 
          
             result(null, resobj);
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



Eatuser.getAllVirtualUser = function getAllVirtualUser(req,result) {
    //console.log(req);
    var query = "select * from User";
    if(req.id !== 'all'){
        query = "select * from User where virutal = "+req.id+" "
    }
    //var search= req.search
    if(req.id !== 'all' && req.search){
        query = query+" and (phoneno LIKE  '%"+req.search+"%' OR email LIKE  '%"+req.search+"%' or name LIKE  '%"+req.search+"% ') "
    }else if(req.search){
        query = query+" where phoneno LIKE  '%"+req.search+"%' OR email LIKE  '%"+req.search+"%' or name LIKE  '%"+req.search+"% ' "
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
    // sql.query("Select * from User where virutal = '"+req+"'", function (err, res) {

    //         if(err) {
    //             console.log("error: ", err);
    //             result(null, err);
    //         }
    //         else{
    //           console.log('User : ', res);  

    //          result(null, res);
    //         }
    //     });   
};


Eatuser.virtual_eatusersearch = function virtual_eatusersearch(req,result) {
   
 console.log(req);
    sql.query("select * from User where phoneno LIKE  '%"+req.search+"%' OR email LIKE  '%"+req.search+"%' or name LIKE  '%"+req.search+"%  ' " , function (err, res) {

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

module.exports= Eatuser;