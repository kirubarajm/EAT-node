'user strict';
var sql = require('../db.js');


//Task object constructor
var Cusinemakeit = function (cusinemakeit) {
    this.cusineid = cusinemakeit.cusineid;
    this.makeit_userid = cusinemakeit.makeit_userid;
    this.created_at = new Date();
};

Cusinemakeit.createCusinemakeit = function createCusinemakeit(cuisine, result) {

  //  console.log(cuisine);
    sql.query("select * from Cusine_makeit where makeit_userid = ?", cuisine.makeit_userid, function (err, res) {
        if (err) {
            console.log("error: ", err);
            res(null, err);
        }else{
            console.log(res.length);
            if (res.length === 0 ) {
                console.log('test');
                sql.query("INSERT INTO Cusine_makeit set ?", cuisine, function (err, res1) {
                    if (err) {
                        console.log("error: ", err);
                        result(null, err);
                    }
                    let sucobj = true;
                    let message = "Insert successfully"
                    let resobj = {
                        success: sucobj,
                        message: message
                    };
    
                    result(null, resobj);
                });

            }else{
                console.log('test1');
                console.log(cuisine);
                sql.query("Update Cusine_makeit set cusineid = '"+cuisine.cusineid+"',makeit_userid = '"+cuisine.makeit_userid+"'",function (err, res2) {
                    if (err) {
                        console.log("error: ", err);
                        result(null, err);
                    }
                    let sucobj = true;
                    let message = "Updated successfully"
                    let resobj = {
                        success: sucobj,
                        message: message
                    };
    
                    result(null, resobj);
                });

            }

        }

    });


    

};




module.exports = Cusinemakeit;