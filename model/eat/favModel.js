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
                favid:res.insertId

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



Fav.read_a_dishlist_byeatuserid = function read_a_dishlist_byeatuserid(userId,result) {
    sql.query("Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img as makeit_image, pt.product_name,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cusinename,ly.localityname  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cusine cu on cu.cusineid=pt.cusine  join Locality ly on mu.localityid=ly.localityid left join Fav fa on fa.productid=pt.productid where pt.active_status = 1 and fa.makeit_userid= 0 and fa.eatuserid  = ? ", userId, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
             let sucobj='true';
            let resobj = {  
            success: sucobj,
            result:res   

            };
            result(null, resobj);
      
        }

        });   
};



Fav.read_a_fav_kitchenlist_byeatuserid = function read_a_fav_kitchenlist_byeatuserid(userId,result) {

    
    sql.query("Select mu.userid as makeituserid,mu.name as makeitusername,mu.brandname as makeitbrandname,mu.rating rating,mu.region,mu.costfortwo,mu.img as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav from MakeitUser mu left join Fav fa on fa.makeit_userid=mu.userid where mu.verified_status = 1 and fa.productid= 0 and fa.eatuserid   = ? ", userId, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            
             let sucobj='true';
            let resobj = {  
            success: sucobj,
            result:res   

            };
            result(null, resobj);
      
        }

        });   
};


module.exports= Fav;