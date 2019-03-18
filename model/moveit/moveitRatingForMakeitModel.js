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



MoveitRatingForMakeit.create_moveit_kitchen_qualitycheck = function create_moveit_kitchen_qualitycheck(kitchenquality,kitchenqualitylist, res) {


    for (let i = 0; i < kitchenqualitylist.length; i++) {
       
        sql.query("INSERT INTO MoveitRatingForMakeit (makeit_userid,moveit_userid,quality_analysis_id,orderid,rating,enabled)values('"+kitchenquality.makeit_userid+"','"+kitchenquality.moveit_userid+"','"+kitchenqualitylist[i].quality_analysis_id+"','"+kitchenquality.orderid+"','"+kitchenquality.rating+"','"+kitchenqualitylist[i].enabled+"')", function (err, res1) {


            
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
    }
    



};



module.exports = MoveitRatingForMakeit;