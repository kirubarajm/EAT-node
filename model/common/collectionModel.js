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

Collection.list_all_active_collection_v2 = function list_all_active_collection_v2(req,result) {
  sql.query("Select cid,query,name,active_status,category,img_url,heading,subheading,created_at from Collections where active_status=1",async function(err, res) {
    if (err) {
      result(err, null);
    } else {



      var kitchens =   await Collection.getcollectionlist_v2(res,req)

      console.log("first collection");
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


Collection.list_all_active_collection = function list_all_active_collection(req,result) {
  sql.query("Select cid,query,name,active_status,category,img_url,heading,subheading,created_at from Collections where active_status=1",async function(err, res) {
    if (err) {
      result(err, null);
    } else {

      var kitchens =   await Collection.getcollectionlist(res,req)

      console.log("first collection");
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
// Collection.list_all_active_collection_new = function list_all_active_collection_new(eatuserid,result) {
//   sql.query("Select cid,query,name,active_status,category,img_url,heading,subheading,created_at from Collections where active_status=1",async function(err, res) {
//     if (err) {
//       result(err, null);
//     } else {

//         var req = {};
//          req.eatuserid = eatuserid
     
//       var kitchens =   await Collection.getcollectionlist(res,req)

//       console.log("first collection");
//        if (res.length !== 0 ) {
//         let resobj = {
//           success: true,
//           status:true,
//           collection: res
//         };
//         result(null, resobj);
//        } else {
//         let resobj = {
//           success: true,
//           status:false,
//           message: "Sorry there no active collections"
//         };
//         result(null, resobj);
//        }
     
//     }
//   });
// };

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

Collection.getkichens = async function(res,req){

  for (let i = 0; i < res.length; i++) {
    req.cid = res[i].cid;
    req.query = res[i].query;
    await Collection.get_all_collection_by_cid_getkichens(req, async function(err,res3) {
      if (err) {
        result(err, null);
      } else {
        if (res3.status != true) {
          result(null, res3);
        } else {
          
         // console.log("kitchenlist"+res3.result);
          res[i].kitchenlist = res3.result;
           
           
        }
      }
    });

  }

return res
}


Collection.getcollectionlist_v2 = async function(res,req){

  for (let i = 0; i < res.length; i++) {
    req.cid = res[i].cid;
    req.query = res[i].query;
    await Collection.get_all_collection_by_cid_getkichens_v2(req, async function(err,res3) {
      if (err) {
        result(err, null);
      } else {
        if (res3.status != true) {
          result(null, res3);
        } else {
          
         // console.log("kitchenlist"+res3.result);
         // res[i].kitchenlist = res3.result;
        var kitchenlist = res3.result
      //   console.log(kitchenlist.length);
          
          if (kitchenlist.length !==0) {
            res[i].collectionstatus = true;
          }else{
            res[i].collectionstatus = false;
          }
           	
          delete res[i].query;
         // delete json[res[i].query]
        }
      }
    });

  }

return res
}

Collection.getcollectionlist = async function(res,req){
  var userdetails = await query("Select * From User where userid = '" +req.eatuserid +"'");
  for (let i = 0; i < res.length; i++) {
    req.cid = res[i].cid;
    console.log("res[i].query"+res[i].query);
    req.query = res[i].query;
    await Collection.get_all_collection_by_cid_getkichens(req, async function(err,res3) {
      if (err) {
        result(err, null);
      } else {
        if (res3.status != true) {
          result(null, res3);
        } else {
          
         // console.log("kitchenlist"+res3.result);
         // res[i].kitchenlist = res3.result;
        var kitchenlist = res3.result
      //   console.log(kitchenlist.length);
          
        if (userdetails[0].first_tunnel == 0) {
        if (kitchenlist.length !==0) {
          res[i].collectionstatus = true;
        }else{
          res[i].collectionstatus = false;
        }
      }else{
        res[i].collectionstatus = true;
      }
           	
          delete res[i].query;
         // delete json[res[i].query]
        }
      }
    });

  }

return res
}

// Collection.getcollectionlist = async function(res,req){

//   var userdetails = await query("Select * From User where userid = '" +req.eatuserid +"'");


//   for (let i = 0; i < res.length; i++) {
//     req.cid = res[i].cid;
//     req.query = res[i].query;
//     await Collection.get_all_collection_by_cid_getkichens(req, async function(err,res3) {
//       if (err) {
//         result(err, null);
//       } else {
//         if (res3.status != true) {
//           result(null, res3);
//         } else {
          
//          // console.log("kitchenlist"+res3.result);
//          // res[i].kitchenlist = res3.result;
//       var kitchenlist = res3.result
//       //   console.log(kitchenlist.length);
//       if (userdetails[0].first_tunnel == 0) {
//         if (kitchenlist.length !==0) {
//           res[i].collectionstatus = true;
//         }else{
//           res[i].collectionstatus = false;
//         }
//       }else{
//         res[i].collectionstatus = true;
//       }
          
//           delete res[i].query;
//          // delete json[res[i].query]
//         }
//       }
//     });

//   }

// return res
// }



Collection.getAllCollection_by_user =async function getAllCollection_by_user(req,result) {

    sql.query("Select * from Collections where active_status=1", async function(err, res) {
      if (err) {
        result(err, null);
      } else {

          if (res.length !==0) {   
         
       var kitchens =   await Collection.getkichens(res,req)
       
            let resobj = {
              success: true,
              status:true,
              result: res
            };
            result(null, resobj);

          }else{
            let resobj = {
              success: true,
              status:false,
              message: "Collection is not available"
            };
            result(null, resobj);
          }
       
      }
    });
};



Collection.get_all_collection_by_cid = async function get_all_collection_by_cid(req,result) {
  
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit = constant.radiuslimit;

   await sql.query("Select * from Collections where active_status= 1 and cid = '"+req.cid+"'", async function(err, res) {
      if (err) {
        result(err, null);
      } else {

      if (res.length !== 0) {
        
        
        var  productquery = '';
        var  groupbyquery = " GROUP BY pt.makeit_userid";
      //  var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";
        var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,mk.unservicable = 0 desc";
      
      
        var breatfastcycle = constant.breatfastcycle;
        var dinnercycle = constant.dinnercycle;
        var lunchcycle = constant.lunchcycle;

        var day = moment().format("YYYY-MM-DD HH:mm:ss");;
        var currenthour  = moment(day).format("HH");
        var productquery = "";
       // console.log(currenthour);

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
      ///product
        if (req.cid == 1 || req.cid == 2 || req.cid == 4 || req.cid == 6 || req.cid == 7) {
          var productlist = res[0].query + productquery  + groupbyquery + " ORDER BY mk.unservicable = 0 desc";
        }else if(req.cid == 3 ) {    ///kitchen
          var productlist = res[0].query + productquery  + orderbyquery;
        }else if(req.cid= 5){
          var productlist = res[0].query + productquery+ " GROUP BY mk.userid ORDER BY mk.unservicable = 0 desc,mk.created_at desc limit 10"
        }
          
        console.log(productlist);
          
         await sql.query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid], function(err, res1) {
            if (err) {
              result(err, null);
            } else {


              for (let i = 0; i < res1.length; i++) {

                if (req.cid == 1 || req.cid == 2 || req.cid == 4 || req.cid == 6 || req.cid == 7) {
                  res1[i].productlist =JSON.parse(res1[i].productlist);
                  //remove duplicate values
                  var arr = res1[i].productlist;
               
                  function getUniqueListBy(arr, key) {
                    return [...new Map(arr.map(item => [item[key], item])).values()]
                 }
                   res1[i].productlist = getUniqueListBy(arr, 'productid')
                }
                
               
              

                res1[i].distance = res1[i].distance.toFixed(2);
                //15min Food Preparation time , 3min 1 km
              //  eta = 15 + 3 * res[i].distance;
                var eta = foodpreparationtime + onekm * res1[i].distance;
                
                // res1[i].serviceablestatus = false;
    
                
                // if (res1[i].distance <= radiuslimit) {
                //   res1[i].serviceablestatus = true;
                // } 

                res1[i].serviceablestatus = false;
                res1[i].status = 1;
  
                if (res1[i].unservicable == 0) {
                  res1[i].serviceablestatus = true;
                  res1[i].status = 0;
                }
                
                if (res1[i].serviceablestatus !== false) {
                 
                  if (res1[i].distance <= radiuslimit) {
                    res1[i].status = 0;
                    res1[i].serviceablestatus = true;
                  }else{
                    res1[i].serviceablestatus = false;
                    res1[i].status = 1;
                  }
                }

              
               
                res1[i].eta = Math.round(eta) + " mins";
                    if (res1[i].cuisines) {
                      res1[i].cuisines = JSON.parse(res1[i].cuisines);
                    }

                 
                
              }

              if (req.cid == 1||req.cid == 4 ||req.cid == 2 || req.cid == 6|| req.cid == 7) {
                res1.sort((a, b) => parseFloat(a.status) - parseFloat(b.status));
              }

            

              let resobj = {
                success: true,
                status: true,
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

Collection.get_all_collection_by_cid_v2 = async function get_all_collection_by_cid_v2(req,result) {
  
  //Collection.get_all_collection_by_cid = async function get_all_collection_by_cid(req,result) {
  
    var foodpreparationtime = constant.foodpreparationtime;
    var onekm = constant.onekm;
    var radiuslimit = constant.radiuslimit;
    var tunnelkitchenliststatus = true;
    const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");
  
    if (userdetails[0].first_tunnel == 1 ) {
      
      tunnelkitchenliststatus = false;
  
    }
  
     await sql.query("Select * from Collections where active_status= 1 and cid = '"+req.cid+"'", async function(err, res) {
        if (err) {
          result(err, null);
        } else {
  
        if (res.length !== 0) {
          
          
          var  productquery = '';
          var  groupbyquery = " GROUP BY pt.makeit_userid";
        //  var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";
        var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,mk.unservicable = 0 desc";
        
        
          var breatfastcycle = constant.breatfastcycle;
          var dinnercycle = constant.dinnercycle;
          var lunchcycle = constant.lunchcycle;
  
          var day = moment().format("YYYY-MM-DD HH:mm:ss");;
          var currenthour  = moment(day).format("HH");
          var productquery = "";
         // console.log(currenthour);
  
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
           if (req.cid == 1 || req.cid == 2 || req.cid == 4 || req.cid == 6 || req.cid == 7) {
          var productlist = res[0].query + productquery  + groupbyquery + " ORDER BY mk.unservicable = 0 desc";
        }else if(req.cid == 3 ) {    ///kitchen
          var productlist = res[0].query + productquery  + orderbyquery;
        }else if(req.cid= 5){
          var productlist = res[0].query + productquery+ " GROUP BY mk.userid ORDER BY mk.unservicable = 0 desc,mk.created_at desc limit 10"
        }
            
  
            console.log(productlist);
           await sql.query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid], function(err, res1) {
              if (err) {
                result(err, null);
              } else {
  
                for (let i = 0; i < res1.length; i++) {
  
                  if (req.cid == 1 || req.cid == 2 || req.cid == 4 || req.cid == 6 || req.cid == 7) {
                    res1[i].productlist =JSON.parse(res1[i].productlist)
                    var arr = res1[i].productlist;
               
                    function getUniqueListBy(arr, key) {
                      return [...new Map(arr.map(item => [item[key], item])).values()]
                   }
                     res1[i].productlist = getUniqueListBy(arr, 'productid')
                  }
                  
                  res1[i].distance = res1[i].distance.toFixed(2);
                  //15min Food Preparation time , 3min 1 km
                //  eta = 15 + 3 * res[i].distance;
                  var eta = foodpreparationtime + onekm * res1[i].distance;
                  
                  // res1[i].serviceablestatus = false;
      
                  
                  // if (res1[i].distance <= radiuslimit) {
                  //   res1[i].serviceablestatus = true;
                  // } 
  
                  res1[i].serviceablestatus = false;
                  res1[i].status = 1;
    
                  if (res1[i].unservicable == 0) {
                    res1[i].serviceablestatus = true;
                    res1[i].status = 0;
                  }
                  
                  if (res1[i].serviceablestatus !== false) {
                   
                    if (res1[i].distance <= radiuslimit) {
                      res1[i].status = 0;
                      res1[i].serviceablestatus = true;
                    }else{
                      res1[i].serviceablestatus = false;
                      res1[i].status = 1;
                    }
                  }
  
                if (tunnelkitchenliststatus == false) {
                  res1[i].status = 0;
                  res1[i].serviceablestatus = true;
                }
                 
                  res1[i].eta = Math.round(eta) + " mins";
                      if (res1[i].cuisines) {
                        res1[i].cuisines = JSON.parse(res1[i].cuisines);
                      }
  
                   
                  
                }
  
                if (req.cid == 1||req.cid == 4 ||req.cid == 2 || req.cid == 6  || req.cid == 7) {
                  res1.sort((a, b) => parseFloat(a.status) - parseFloat(b.status));
                }
  
              
  
                let resobj = {
                  success: true,
                  status: true,
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
  //};
};



// Collection.get_all_collection_by_cid = async function get_all_collection_by_cid(req,result) {
  
//   var foodpreparationtime = constant.foodpreparationtime;
//   var onekm = constant.onekm;
//   var radiuslimit = constant.radiuslimit;
//   var tunnelkitchenliststatus = true;
//   const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");

//   if (userdetails[0].first_tunnel == 1 ) {
    
//     tunnelkitchenliststatus = false;

//   }

//    await sql.query("Select * from Collections where active_status= 1 and cid = '"+req.cid+"'", async function(err, res) {
//       if (err) {
//         result(err, null);
//       } else {

//       if (res.length !== 0) {
        
        
//         var  productquery = '';
//         var  groupbyquery = " GROUP BY pt.makeit_userid";
//       //  var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";
//       var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,mk.unservicable = 0 desc";
      
      
//         var breatfastcycle = constant.breatfastcycle;
//         var dinnercycle = constant.dinnercycle;
//         var lunchcycle = constant.lunchcycle;

//         var day = moment().format("YYYY-MM-DD HH:mm:ss");;
//         var currenthour  = moment(day).format("HH");
//         var productquery = "";
//        // console.log(currenthour);

//         if (currenthour < lunchcycle) {

//           productquery = productquery + " and pt.breakfast = 1";
//         //  console.log("breakfast");
//         }else if(currenthour >= lunchcycle && currenthour < dinnercycle){

//           productquery = productquery + " and pt.lunch = 1";
//         //  console.log("lunch");
//         }else if( currenthour >= dinnercycle){
          
//           productquery = productquery + " and pt.dinner = 1";
//         //  console.log("dinner");
//         }
      

//       //based on logic this conditions will change
//         if (req.cid === 1 || req.cid === 2) {
//           var productlist = res[0].query + productquery  + groupbyquery + " ORDER BY mk.unservicable = 0 desc";
//         }else if(req.cid === 3 ) {
//           var productlist = res[0].query + productquery  + orderbyquery;
//         }
          

          
//          await sql.query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid], function(err, res1) {
//             if (err) {
//               result(err, null);
//             } else {

//               for (let i = 0; i < res1.length; i++) {

//                 if (req.cid === 1 || req.cid === 2) {
//                   res1[i].productlist =JSON.parse(res1[i].productlist)
//                 }
                
//                 // res1[i].distance = res1[i].distance * constant.onemile;
//                 // res1[i].distance = res1[i].distance.toFixed(2) ;
//                 // console.log( res1[i].distance);
//                 //15min Food Preparation time , 3min 1 km
//               //  eta = 15 + 3 * res[i].distance;
//                 var eta = foodpreparationtime + (onekm * res1[i].distance);
                
//                 // res1[i].serviceablestatus = false;
    
                
//                 // if (res1[i].distance <= radiuslimit) {
//                 //   res1[i].serviceablestatus = true;
//                 // } 

//                 res1[i].serviceablestatus = false;
//                 res1[i].status = 1;
  
//                 if (res1[i].unservicable == 0) {
//                   res1[i].serviceablestatus = true;
//                   res1[i].status = 0;
//                 }
                
//                 if (res1[i].serviceablestatus !== false) {
                 
//                   if (res1[i].distance <= radiuslimit) {
//                     res1[i].status = 0;
//                     res1[i].serviceablestatus = true;
//                   }else{
//                     res1[i].serviceablestatus = false;
//                     res1[i].status = 1;
//                   }
//                 }

//               if (tunnelkitchenliststatus == false) {
//                 res1[i].status = 0;
//                 res1[i].serviceablestatus = true;
//               }
               
//                 res1[i].eta = Math.round(eta) + " mins";
//                     if (res1[i].cuisines) {
//                       res1[i].cuisines = JSON.parse(res1[i].cuisines);
//                     }

                 
                
//               }

//               if (req.cid = 1) {
//                 res1.sort((a, b) => parseFloat(a.status) - parseFloat(b.status));
//               }

            

//               let resobj = {
//                 success: true,
//                 status: true,
//                 result: res1
//               };
//               result(null, resobj);

//             }

//           });
//         }else{

//           let resobj = {
//             success: true,
//             status: false,
//             result: res
//           };
//           result(null, resobj);


//         }
//       }
//     });
// };

// Collection.get_all_collection_by_cid_v2 = async function get_all_collection_by_cid_v2(req,result) {
  
//   //Collection.get_all_collection_by_cid = async function get_all_collection_by_cid(req,result) {
  
//     var foodpreparationtime = constant.foodpreparationtime;
//     var onekm = constant.onekm;
//     var radiuslimit = constant.radiuslimit;
//     var tunnelkitchenliststatus = true;
//     const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");
  
//     if (userdetails[0].first_tunnel == 1 ) {
      
//       tunnelkitchenliststatus = false;
  
//     }
  
//      await sql.query("Select * from Collections where active_status= 1 and cid = '"+req.cid+"'", async function(err, res) {
//         if (err) {
//           result(err, null);
//         } else {
  
//         if (res.length !== 0) {
          
          
//           var  productquery = '';
//           var  groupbyquery = " GROUP BY pt.makeit_userid";
//         //  var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";
//         var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,mk.unservicable = 0 desc";
        
        
//           var breatfastcycle = constant.breatfastcycle;
//           var dinnercycle = constant.dinnercycle;
//           var lunchcycle = constant.lunchcycle;
  
//           var day = moment().format("YYYY-MM-DD HH:mm:ss");;
//           var currenthour  = moment(day).format("HH");
//           var productquery = "";
//          // console.log(currenthour);
  
//           if (currenthour < lunchcycle) {
  
//             productquery = productquery + " and pt.breakfast = 1";
//           //  console.log("breakfast");
//           }else if(currenthour >= lunchcycle && currenthour < dinnercycle){
  
//             productquery = productquery + " and pt.lunch = 1";
//           //  console.log("lunch");
//           }else if( currenthour >= dinnercycle){
            
//             productquery = productquery + " and pt.dinner = 1";
//           //  console.log("dinner");
//           }
        
  
//         //based on logic this conditions will change
//           if (req.cid === 1 || req.cid === 2) {
//             var productlist = res[0].query + productquery  + groupbyquery + " ORDER BY mk.unservicable = 0 desc";
//           }else if(req.cid === 3 ) {
//             var productlist = res[0].query + productquery  + orderbyquery;
//           }
            
  
            
//            await sql.query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid], function(err, res1) {
//               if (err) {
//                 result(err, null);
//               } else {
  
//                 for (let i = 0; i < res1.length; i++) {
  
//                   if (req.cid === 1 || req.cid === 2) {
//                     res1[i].productlist =JSON.parse(res1[i].productlist)
//                   }
                  
//                 //  res1[i].distance = res1[i].distance.toFixed(2);
//                 // res1[i].distance =  res1[i].distance * constant.onemile;
//                 // res1[i].distance =  res1[i].distance.toFixed(2);
//                   //console.log(res[i].distance);
//                   //15min Food Preparation time , 3min 1 km
//                 //  eta = 15 + 3 * res[i].distance;
//                 var eta = foodpreparationtime + onekm * res1[i].distance;
                  
//                   // res1[i].serviceablestatus = false;
      
                  
//                   // if (res1[i].distance <= radiuslimit) {
//                   //   res1[i].serviceablestatus = true;
//                   // } 
  
//                   res1[i].serviceablestatus = false;
//                   res1[i].status = 1;
    
//                   if (res1[i].unservicable == 0) {
//                     res1[i].serviceablestatus = true;
//                     res1[i].status = 0;
//                   }
                  
//                   if (res1[i].serviceablestatus !== false) {
                   
//                     if (res1[i].distance <= radiuslimit) {
//                       res1[i].status = 0;
//                       res1[i].serviceablestatus = true;
//                     }else{
//                       res1[i].serviceablestatus = false;
//                       res1[i].status = 1;
//                     }
//                   }
  
//                 if (tunnelkitchenliststatus == false) {
//                   res1[i].status = 0;
//                   res1[i].serviceablestatus = true;
//                 }
                 
//                   res1[i].eta = Math.round(eta) + " mins";
//                       if (res1[i].cuisines) {
//                         res1[i].cuisines = JSON.parse(res1[i].cuisines);
//                       }
  
                   
                  
//                 }
  
//                 if (req.cid = 1) {
//                   res1.sort((a, b) => parseFloat(a.status) - parseFloat(b.status));
//                 }
  
              
  
//                 let resobj = {
//                   success: true,
//                   status: true,
//                   result: res1
//                 };
//                 result(null, resobj);
  
//               }
  
//             });
//           }else{
  
//             let resobj = {
//               success: true,
//               status: false,
//               result: res
//             };
//             result(null, resobj);
  
  
//           }
//         }
//       });
//   //};
// };


// Collection.get_all_collection_by_cid_v2 = async function get_all_collection_by_cid_v2(req,result) {
  
//   var foodpreparationtime = constant.foodpreparationtime;
//   var onekm = constant.onekm;
//   var radiuslimit=constant.radiuslimit;

//    await sql.query("Select * from Collections where active_status= 1 and cid = '"+req.cid+"'", async function(err, res) {
//       if (err) {
//         result(err, null);
//       } else {

//       if (res.length !== 0) {
        
        
//         var  productquery = '';
//         var  groupbyquery = " GROUP BY pt.makeit_userid";
//         var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";
      
//         var breatfastcycle = constant.breatfastcycle;
//         var dinnercycle = constant.dinnercycle;
//         var lunchcycle = constant.lunchcycle;

//         var day = moment().format("YYYY-MM-DD HH:mm:ss");;
//         var currenthour  = moment(day).format("HH");
//         var productquery = "";
//         var ifconditionquery = '';
//         var cycle = '' ;
//         var nextcycle ='';
//         var where_condition_query = '';
//         var orderby = '';
//        // console.log(currenthour);

//         if (currenthour < lunchcycle) {

//           productquery = productquery + " and pt.breakfast = 1";
//           ifnextavaquery = "pt.breakfast";
//           ifnextavatimequery = "IF(pt.breakfast =1,'12 PM','16 PM')"
//           cycle = cycle + constant.breatfastcycle + 'AM';
//           nextcycle = nextcycle + constant.lunchcycle + ' PM';
//           where_condition_query = " and (pt.breakfast = 1 OR pt.lunch = 1)";
//           orderby = " order by pt.breakfast = 1 desc";
//         //  console.log("breakfast");
//         }else if(currenthour >= lunchcycle && currenthour < dinnercycle){

//           productquery = productquery + " and pt.lunch = 1";
//           ifnextavaquery ="pt.lunch";
//           ifnextavatimequery ="IF(pt.lunch =1,12 PM,16 PM)"
//           cycle =  cycle + constant.lunchcycle + ' PM';
//           nextcycle = nextcycle + constant.dinnercycle + ' PM';
//           where_condition_query =" and (pt.lunch = 1 OR pt.dinner = 1)";
//           orderby = " order by pt.lunch = 1 desc";
//         }else if( currenthour >= dinnercycle){
          
//           productquery = productquery + " and pt.dinner = 1";
//           ifnextavaquery = "pt.dinner";
//           ifnextavatimequery = "IF(pt.lunch =1,12 PM,16 PM)"
//          // ifconditionquery = "IF(pt.dinner =1,false,true)";
//          // IF(pt.dinner =1,'12 PM','16 PM')
//           cycle = cycle + constant.dinnercycle + 'PM';
//           nextcycle = nextcycle +"Tomorrow "+ constant.breatfastcycle + ' AM';
//           where_condition_query = " and (pt.dinner = 1 OR  pt.breakfast = 1)";
//           orderby = " order by pt.dinner = 1 desc";
//         //  console.log("dinner");
//         }
      

//       //based on logic this conditions will change
//         // if (req.cid === 1 || req.cid === 2) {
//         //   var dyQ=res[0].query.replace(new RegExp('pt.dinner', 'g'),ifnextavaquery);
//         //   var productlist = dyQ+ where_condition_query  + groupbyquery + orderby;//res[0].query;
//         //   //var productlist = res[0].query + productquery  + groupbyquery;
//         // }else if(req.cid === 3 ) {
//         //   // var dyQ=res[0].query.replace(new RegExp('pt.dinner', 'g'),ifnextavaquery);
//         //   // var productlist = dyQ+ where_condition_query  + groupbyquery + orderby;//res[0].query;
//         //   var productlist = res[0].query + productquery  + orderbyquery;
//         // }
       

        
//         //req.ifconditionquery = ifconditionquery.replace(/\'/gi,'')
//         console.log(productlist);
//         //console.log(req.ifconditionquery);
//        // console.log(dyQ);
//         //console.log([req.lat,req.lon,req.lat,ifconditionquery,ifconditionquery,cycle,nextcycle,req.eatuserid,req.eatuserid] );
       
  
        
//          await sql.query(productlist, [req.lat,req.lon,req.lat,cycle,nextcycle,req.eatuserid,req.eatuserid] , function(err, res1) {
//             if (err) {
//               result(err, null);
//             } else {
              
//               for (let i = 0; i < res1.length; i++) {

//                 if (req.cid === 1 || req.cid === 2) {
//                   res1[i].productlist =JSON.parse(res1[i].productlist)
//                 }
                
//                 res1[i].distance = res1[i].distance.toFixed(2);
//                 //15min Food Preparation time , 3min 1 km
//               //  eta = 15 + 3 * res[i].distance;
//                 var eta = foodpreparationtime + onekm * res1[i].distance;
                
//                 res1[i].serviceablestatus = false;
    
                
//                 if (res1[i].distance <= radiuslimit) {
//                   res1[i].serviceablestatus = true;
//                 } 
               
//                 res1[i].eta = Math.round(eta) + " mins";
//                     if (res1[i].cuisines) {
//                       res1[i].cuisines = JSON.parse(res1[i].cuisines);
//                     }
              
//               }

//               let resobj = {
//                 success: true,
//                 status:true,
//                 result: res1
//               };
//               result(null, resobj);

//             }

//           });
//         }else{

//           let resobj = {
//             success: true,
//             status: false,
//             result: res
//           };
//           result(null, resobj);


//         }
//       }
//     });
// };

Collection.get_all_collection_by_cid_getkichens = async function get_all_collection_by_cid_getkichens(req,result) {
  
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;
  var  productquery = '';
  var  groupbyquery = " GROUP BY pt.makeit_userid";
  var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";

  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;

  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
  var productquery = "";
 // console.log(currenthour);

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
  if (req.cid == 1 || req.cid == 2 || req.cid == 4 || req.cid == 6 || req.cid == 7) {
    var productlist = req.query + productquery  + groupbyquery;
  }else if(req.cid == 3 ) {
    var productlist = req.query + productquery  + orderbyquery;
  }else if(req.cid= 5){
    var productlist = req.query + productquery+ " GROUP BY mk.userid ORDER BY mk.unservicable = 0 desc,mk.created_at desc limit 10"
  }
 
//  console.log(productlist);
    var res1 = await query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid])

        for (let i = 0; i < res1.length; i++) {

          if (req.cid === 1 || req.cid === 2 || req.cid == 4 || req.cid == 6 || req.cid == 7) {
            res1[i].productlist =JSON.parse(res1[i].productlist)
          }
          
         // res1[i].distance = res1[i].distance.toFixed(2);
        //  res1[i].distance = res1[i].distance * constant.onemile;
        //  res1[i].distance = res1[i].distance.toFixed(2) ;
        //   console.log(res1[i].distance);
          //15min Food Preparation time , 3min 1 km
        //  eta = 15 + 3 * res[i].distance;
          var eta = foodpreparationtime + (onekm * res1[i].distance);
          
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

  
};

Collection.get_all_collection_by_cid_getkichens_v2 = async function get_all_collection_by_cid_getkichens_v2(req,result) {
  
        var foodpreparationtime = constant.foodpreparationtime;
        var onekm = constant.onekm;
        var radiuslimit=constant.radiuslimit;
        var  productquery = '';
        var  groupbyquery = " GROUP BY pt.makeit_userid";
        var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";
      
        var breatfastcycle = constant.breatfastcycle;
        var dinnercycle = constant.dinnercycle;
        var lunchcycle = constant.lunchcycle;

        var day = moment().format("YYYY-MM-DD HH:mm:ss");;
        var currenthour  = moment(day).format("HH");
        var productquery = "";

        var ifconditionquery = '';
        var cycle = '' ;
        var nextcycle ='';
        var where_condition_query = '';
        var orderby = '';
       // console.log(currenthour);

        if (currenthour < lunchcycle) {

          productquery = productquery + " and pt.breakfast = 1";
          ifnextavaquery = "pt.breakfast";
          ifnextavatimequery = "IF(pt.breakfast =1,'12 PM','16 PM')"
          cycle = cycle + constant.breatfastcycle + 'AM';
          nextcycle = nextcycle + constant.lunchcycle + ' PM';
          where_condition_query = " and (pt.breakfast = 1 OR pt.lunch = 1)";
          orderby = " order by pt.breakfast = 1 desc";
        //  console.log("breakfast");
        }else if(currenthour >= lunchcycle && currenthour < dinnercycle){

          productquery = productquery + " and pt.lunch = 1";
          ifnextavaquery ="pt.lunch";
          ifnextavatimequery ="IF(pt.lunch =1,12 PM,16 PM)"
          cycle =  cycle + constant.lunchcycle + ' PM';
          nextcycle = nextcycle + constant.dinnercycle + ' PM';
          where_condition_query =" and (pt.lunch = 1 OR pt.dinner = 1)";
          orderby = " order by pt.lunch = 1 desc";
        //  console.log("lunch");
        }else if( currenthour >= dinnercycle){
          
          productquery = productquery + " and pt.dinner = 1";
          ifnextavaquery = "pt.dinner";
          ifnextavatimequery = "IF(pt.lunch =1,12 PM,16 PM)"
         // ifconditionquery = "IF(pt.dinner =1,false,true)";
         // IF(pt.dinner =1,'12 PM','16 PM')
          cycle = cycle + constant.dinnercycle + 'PM';
          nextcycle = nextcycle +"Tomorrow "+ constant.breatfastcycle + ' AM';
          where_condition_query = " and (pt.dinner = 1 OR  pt.breakfast = 1)";
          orderby = " order by pt.dinner = 1 desc";
        //  console.log("dinner");
        }
      

     
      //based on logic this conditions will change
        // if (req.cid === 1 || req.cid === 2) {
        //   var dyQ=req.query.replace(new RegExp('pt.dinner', 'g'),ifnextavaquery);
        //   var productlist = dyQ + where_condition_query  + groupbyquery ;
        // }else if(req.cid === 3 ) {
        //   var productlist = req.query + productquery  + orderbyquery;
        // }


         //based on logic this conditions will change
         if (req.cid === 1 || req.cid === 2) {
       //   var dyQ=req.query.replace(new RegExp('pt.dinner', 'g'),ifnextavaquery);
          var productlist = req.query + where_condition_query   ;
        }else if(req.cid === 3 ) {
          var productlist = req.query + productquery  ;
        }
       
        console.log(productlist);
      //   var res1 = await query(productlist,[req.lat,req.lon,req.lat,cycle,nextcycle,req.eatuserid,req.eatuserid])
   
          var res1 = await query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid])

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

        
};

module.exports = Collection;
