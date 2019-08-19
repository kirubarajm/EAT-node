"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var constant = require('../constant.js');

var Collection = function(collection) {
  this.name = collection.name;
  this.active_status = collection.active_status;
  this.query = collection.query;
  this.category = collection.category;  
  this.collection_image = collection.collection_image;
  this.collection_title = collection.collection_title;
  this.collection_description = collection.collection_description;
}

Collection.createCollection = function createCollection(req, result) {
      sql.query("INSERT INTO Collection set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
            let resobj = {
              success: true,
              status:true,
              message: "Collection created successfully"
            };
            result(null, resobj);
          }
      });
      
};

Collection.list_all_active_collection = function list_all_active_collection(req,result) {
  sql.query("Select cid,name,active_status,category,img_url,heading,subheading,created_at from Collections where active_status=1", function(err, res) {
    if (err) {
      result(err, null);
    } else {
       if (res.length !== 0 ) {
        let resobj = {
          success: true,
          status:true,
          collection: res
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

Collection.updateByCollectionId = function(cid,active_status) {
  sql.query(
    "UPDATE Collection SET active_status=? WHERE cid = ?",
    [active_status, cid],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Collection.remove = function(cid, result) {
  sql.query("DELETE FROM Collection WHERE cid = ? and active_status=1", [cid], function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Collection.getAllCollection_by_user = function getAllCollection_by_user(userid,result) {

    sql.query("Select * from Collection where active_status=1", function(err, res) {
      if (err) {
        result(err, null);
      } else {









        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    });
};

Collection.get_all_collection_by_cid = function get_all_collection_by_cid(req,result) {
  
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;

    sql.query("Select * from Collections where active_status= 1 and cid = '"+req.cid+"'", function(err, res) {
      if (err) {
        result(err, null);
      } else {

      if (res.length !== 0) {
        
        
        var  productquery = '';
        var  groupbyquery = " GROUP BY pt.makeit_userid";
        var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";
      
      var breatfastcycle = constant.breatfastcycle;
      var dinnercycle = constant.dinnercycle;
      var lunchcycle = constant.lunchcycle;

      var day = moment().format("YYYY-MM-DD HH:mm:ss");;
      var currenthour  = moment(day).format("HH");
      var productquery = "";
      console.log(currenthour);

      if (currenthour < lunchcycle) {

        productquery = productquery + " and pt.breakfast = 1";
      //  console.log("breakfast");
      }else if(currenthour >= lunchcycle && currenthour < dinnercycle){

        productquery = productquery + " and pt.lunch = 1";
      //  console.log("lunch");
      }else if( currenthour >= dinnercycle){
        
        productquery = productquery + " and pt.dinner = 1";
      //  console.log("dinner");
      }
      

      //based on logic this conditions will change
        if (req.cid === 1 || req.cid === 2) {
          var productlist = res[0].query + productquery  + groupbyquery;
        }else if(req.cid === 3 ) {
          var productlist = res[0].query + productquery  + orderbyquery;
        }
          
          console.log( productlist);
          sql.query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid], function(err, res1) {
            if (err) {
              result(err, null);
            } else {

              for (let i = 0; i < res1.length; i++) {

                if (req.cid === 1 || req.cid === 2) {
                  res1[i].productlist =JSON.parse(res1[i].productlist)
                }
                
                res1[i].distance = res1[i].distance.toFixed(2);
                //15min Food Preparation time , 3min 1 km
              //  eta = 15 + 3 * res[i].distance;
                var eta = foodpreparationtime + onekm * res1[i].distance;
                
                res1[i].serviceablestatus = false;
    
                
                if (res1[i].distance <= radiuslimit) {
                  res1[i].serviceablestatus = true;
                } 
               
                res1[i].eta = Math.round(eta) + " mins";
                    if (res1[i].cuisines) {
                      res1[i].cuisines = JSON.parse(res1[i].cuisines);
                    }
              
              }

              let resobj = {
                success: true,
                status:true,
                result: res1
              };
              result(null, resobj);

            }

          });
        }else{

          let resobj = {
            success: true,
            status: false,
            result: res
          };
          result(null, resobj);


        }
      }
    });
};

module.exports = Collection;
