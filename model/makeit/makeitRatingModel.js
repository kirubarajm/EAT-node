'user strict';
var sql = require('../db.js');

//Task object constructor
var Makeitrating = function (makeitrating) {
    this.makeit_userid = makeitrating.makeit_userid;
    this.rating = makeitrating.rating;
    this.sales_emp_id = makeitrating.sales_emp_id;
    this.created_at = new Date();    
};


Makeitrating.createRating = function createRating(new_rating, result) {    
    sql.query("INSERT INTO SalesRatingForMakeit set ?", new_rating, function (err, res) {
            
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                //console.log(res.insertId);
                sql.query("UPDATE Allocation SET status = 1 WHERE makeit_userid = ? and sales_emp_id = ?" , [new_rating.makeit_userid,new_rating.sales_emp_id], function (err, res) {
                    if(err) {
                        console.log("error: ", err);
                          result(null, err);
                       }
                     else{
                        // var makeitfollowupstatus = new Makeituser(req);
                        // Makeituser.update_makeit_followup_status(makeitfollowupstatus, function (err, result) {
                        //     if (err)
                        //     result.send(err);
                        //     // res.json(result);
                        // }); 
                        
                        let sucobj=true;
                        let mesobj = "Job completed successfully";
                        let resobj = {  
                        success: sucobj,
                        message:mesobj
                        }; 
                    
                            result(null, resobj);
                          }
                      });                 
                    }
        });           
};

module.exports= Makeitrating;