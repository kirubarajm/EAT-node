
'user strict';
var sql = require('../db.js');
var Makeituser = require("../../model/makeit/makeitUserModel.js");

//Task object constructor
var MakeitApproved = function (makeitrating) {
    this.makeit_userid = makeitrating.makeit_userid;
    this.verified_status = makeitrating.verified_status;
    this.sales_emp_id = makeitrating.sales_emp_id;
    //this.created_at = new Date();    
};

MakeitApproved.makeitApprovedUpdate = function makeitApprovedUpdate(updatestate, result) {
    
    Makeituser.updatemakeit_user_approval(updatestate,function (err, res) {
        if(err) {
            console.log("error: ", err);
              result(null, err);
           }
         else{
            let sucobj=true;
            let mesobj = "Job completed successfully";
            let resobj = {  
            success: sucobj,
            message:mesobj
            }; 
                result(null, resobj);
              }
          })
}

module.exports= MakeitApproved;