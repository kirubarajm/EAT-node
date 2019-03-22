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
    this.virtualkey= eatuser.virtualkey;
};



Eatuser.createUser = function createUser(newUser, result) {   
    
    if(newUser.virtualkey==null)
    newUser.virtualkey=0;

    sql.query("Select * from User where phoneno = '"+newUser.phoneno+"' OR email= '"+newUser.email+"' " , function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{

            if(res.length == 0){

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

Eatuser.getUserById = function getUserById(userId, result) {
        sql.query("Select * from User where userid = ? ", userId, function (err, res) {             
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
    var userlimit = 20;
    var page = req.page||1;
    var startlimit = (page - 1)*userlimit;
    
    var query = "select * from User";
    
    if(req.virtualkey !== 'all'){
        query = "select * from User where virtualkey = "+req.virtualkey+" "
    }
    
    if(req.virtualkey !== 'all' && req.search){
        query = query+" and (phoneno LIKE  '%"+req.search+"%' OR email LIKE  '%"+req.search+"%' or name LIKE  '%"+req.search+"% ') "
    }else if(req.search){
        query = query+" where phoneno LIKE  '%"+req.search+"%' OR email LIKE  '%"+req.search+"%' or name LIKE  '%"+req.search+"% ' "
    }
    
    var  limitquery=query+ " order by userid desc limit "+startlimit+","+userlimit+" ";
    
    sql.query(limitquery, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            var totalcount = 0;

            sql.query(query, function (err, res2) {
                 totalcount = res2.length;

                 let sucobj=true;
                 let resobj = {  
                   success: sucobj,
                   totalcount:totalcount,
                   result: res
                   
                   }; 
       
                result(null, resobj);
            });
        }
    }); 
  
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