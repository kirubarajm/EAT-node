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
                let sucobj='true';
                let message = 'Thanks for your rating';
                let resobj = {  
                success: sucobj,
                message:message
                };
                result(null, resobj);
            }
        });           
};

module.exports= Makeitrating;