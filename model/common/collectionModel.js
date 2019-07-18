"user strict";

var sql = require("../db.js");
const util = require('util');

const query = util.promisify(sql.query).bind(sql);

var Collection = function(collection) {
  this.name = collection.name;
  this.active_status = collection.active_status;
  this.query = collection.query;
  this.category = collection.category;  
  this.collection_image = collection.collection_image;
  this.collection_title = collection.collection_title;
  this.collection_description = collection.collection_description;
}


Collection.createCoupon = function createCoupon(req, result) {


 
      sql.query("INSERT INTO Collection set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
            let sucobj = true;
            let message = "Collection created successfully";
            let resobj = {
              success: sucobj,
              message: message
            };
            result(null, resobj);
          }
        });
      
};


Collection.list_all_active_collection = function list_all_active_collection(req,result) {
  sql.query("Select * from Collections where active_status=1", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {

       if (res.length !== 0 ) {
       
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
       } else {
        
        let resobj = {
          success: true,
          status:false,
          message: "Sorry there no active collections"
        };
        result(null, resobj);
       }
     
    }
  });
};

Collection.updateByCouponId = function(cid,active_status) {

  var useddate=new Date();
  sql.query(
    "UPDATE Collection SET active_status=? WHERE cid = ?",
    [active_status, cid],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};


Collection.remove = function(cid, result) {
  sql.query("DELETE FROM Collection WHERE cid = ? and active_status=1", [cid], function(err, res) {
    if (err) {
      console.log("error: ", err);  
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Collection.getAllcoupon_by_user = function getAllcoupon_by_user(userid,result) {
    sql.query("Select * from Collection where active_status=?",[userid], function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        let sucobj = "true";
        let resobj = {
          success: sucobj,
          result: res
        };
        result(null, resobj);
      }
    });
  };


  Collection.get_all_collection_by_cid = function get_all_collection_by_cid(req,result) {
    sql.query("Select * from Collections where active_status= 1 and cid = '"+req.cid+"'", function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {

          var productlist = res[0].query;

          console.log(productlist);

          sql.query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid], function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {
              
              for (let i = 0; i < res1.length; i++) {
                
                if (req.cid === 1) {
                  res1[i].productlist =JSON.parse(res1[i].productlist)
                }
                console.log(res1[i].distance);
                res1[i].distance = res1[i].distance.toFixed(2);
                //15min Food Preparation time , 3min 1 km
               // console.log(res1[i].distance);
              // var  eta = 15 + (3 * res[i].distance);
              //   res1[i].eta = Math.round(eta) + " mins";


                if (res1[i].cuisines) {
                  res1[i].cuisines = JSON.parse(res1[i].cuisines);
                }
              
            }


              let sucobj = "true";
              let resobj = {
                success: sucobj,
                result: res1
              };
              result(null, resobj);

            }

          });
      
      }
    });
  };

module.exports = Collection;
