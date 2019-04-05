'user strict';
var sql = require('../db.js');

//Task object constructor
var MoveitRatingForMakeit = function (moveitratingformakeit) {
    this.makeit_userid = moveitratingformakeit.makeit_userid;
    this.moveit_userid = moveitratingformakeit.moveit_userid;
    this.quality_analysis_id = moveitratingformakeit.quality_analysis_id;
    this.orderid = moveitratingformakeit.orderid;
    this.rating = moveitratingformakeit.rating;
    this.enabled = moveitratingformakeit.enabled;
    this.created_at = new Date();    
};



MoveitRatingForMakeit.create_moveit_kitchen_qualitycheck = function create_moveit_kitchen_qualitycheck(kitchenqualitylist, res) {

        sql.query("INSERT INTO MoveitRatingForMakeit set ?", kitchenqualitylist, function (err, res1) {
  
            if (err) {
                console.log("error: ", err);
                res(null, err);
            }

                  let sucobj=true;
                  let mesobj = " Created successfully";
                  let resobj = {  
                    success: sucobj,
                    message:mesobj,
                    
                    }; 
            res(null, resobj);

                
        });   
};

MoveitRatingForMakeit.getUserById = function getUserById(userId, result) {
    sql.query("Select * From MoveitRatingForMakeit mu INNER JOIN  Moveit_hubs mh  ON mu.moveit_hub = mh.moveithub_id where mu.userid = ? ", userId, function (err, res) {             
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

MoveitRatingForMakeit.getAllUser = function getAllUser(result) {
    sql.query("Select * from MoveitRatingForMakeit", function (err, res) {

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

MoveitRatingForMakeit.MoveitRatingForMakeit = function(req, result){
sql.query("UPDATE MoveitRatingForMakeit SET  rating = ? WHERE makeit_userid = ? and orderid = ? and moveit_userid = ?", [req.rating,req.makeit_userid,req.orderid,req.moveit_userid], function (err, res) {
    if(err) {
        console.log("error: ", err);
        result(err, null);
    }
    else{
       let sucobj=true;
       let message = "Rating has been done successfully";
        let resobj = {  
        success: sucobj,
        message:message
        }; 

     result(null, resobj);
  
    }
        }); 
};

MoveitRatingForMakeit.remove = function(id, result){
 sql.query("DELETE FROM MoveitRatingForMakeit WHERE userid = ?", [id], function (err, res) {

            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
           
             result(null, res);
            }
        }); 
};



MoveitRatingForMakeit.get_moveit_quality_checklist = function get_moveit_quality_checklist(req,result) {

    [req.orderid,req.makeit_userid]
    sql.query("Select DISTINCT mrm.quality_analysis_id as id,qa.description,mrm.enabled,mrm.created_at as created_at from MoveitRatingForMakeit mrm join quality_analysis qa on mrm.quality_analysis_id = qa.id where mrm.orderid = '"+req.orderid+"' and mrm.makeit_userid = '"+req.makeit_userid+"' AND created_at= (select  MAX(created_at) from  MoveitRatingForMakeit where orderid = '"+req.orderid+"' and makeit_userid = '"+req.makeit_userid+"') ", function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result : res
            }; 
    
         result(null, resobj);
      
        }
        });   
};

module.exports = MoveitRatingForMakeit;