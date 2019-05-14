'user strict';
var sql = require('../db.js');

var Cluster = function(cluster){
    this.clustername=cluster.clustername;
    this.avg_rating=cluster.avg_rating;
};

Cluster.getAllcluster = function getAllcluster(result) {
        sql.query("Select * from Cluster", function (err, res) {
                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }else{
                    let sucobj='true';
                    let resobj = {  
                    success: sucobj,
                    result: res 
                    };
                    result(null, resobj);
                }
            });   
};

module.exports= Cluster;