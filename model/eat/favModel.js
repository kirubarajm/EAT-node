'user strict';
var sql = require('../db.js');

//Task object constructor
var Fav = function(fav){
    this.eatuserid = fav.eatuserid;
    this.productid=fav.productid || 0;
    this.created_at = new Date();
    this.makeit_userid = fav.makeit_userid || 0;
};


Fav.createFav = function createFav(newFav, result) {    
        sql.query("INSERT INTO Fav set ?", newFav, function (err, res) {
                
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                 let sucobj='true';
                 let message = 'Fav created successfully';
                let resobj = {  
                success: sucobj,
                message:message,

                };
                result(null, resobj);
          
            }
            });           
};

Fav.getFavById = function getFavById(userId, result) {
        sql.query("Select * from Fav where favid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};

Fav.getAllFav = function getAllFav(result) {
        sql.query("Select * from Fav", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Fav : ', res);  

                 result(null, res);
                }
            });   
};

Fav.updateById = function(id, user, result){
  sql.query("UPDATE Fav SET task = ? WHERE favid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Fav.remove = function(id, result){

     sql.query("DELETE FROM Fav WHERE favid = ?", [id], function (err, res) {
                if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                 let sucobj='true';
                 let message = 'Fav removed successfully';
                let resobj = {  
                success: sucobj,
                message:message,

                };
                result(null, resobj);
          
            }
            }); 
};

Fav.getAllFavByEatUser = function getAllFavByEatUser(userId,result) {
        sql.query("Select * from Fav where eatuserid = ? ", userId, function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Fav : ', res);  
                 result(null, res);
                }

            });   
};

module.exports= Fav;