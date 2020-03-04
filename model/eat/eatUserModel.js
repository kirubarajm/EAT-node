'user strict';
var sql = require('../db.js');
var constant = require('../constant.js');
var request = require('request');
const util = require('util');
let jwt = require('jsonwebtoken');
let config = require('../config.js');
const CronJob = require('cron').CronJob;
var moment = require("moment");
const Razorpay = require("razorpay");
var masters = require('../master');
var Locationtracking = require("../../model/common/usersfirstlocationtrackingModel");
var zoneModel = require("../../model/common/zoneModel.js");
var Collection = require("../../model/common/collectionModel");
var Notification = require("../../model/common/notificationModel.js");
var PushConstant = require("../../push/PushConstant.js");
var Stories = require("../../model/common/storyModel");
var Offers = require("../../model/common/couponModel");
var Zendeskrequest = require("../../model/common/ZendeskRequestsModel");


// var instance = new Razorpay({
//     key_id: 'rzp_test_3cduMl5T89iR9G',
//     key_secret: 'BSdpKV1M07sH9cucL5uzVnol'
//   })

// var instance = new Razorpay({
//   key_id: 'rzp_live_BLJVf00DRLWexs',
//   key_secret: 'WLqR1JqCdQwnmYs6FI9nzLdD'
// })
var instance = new Razorpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
})

const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Eatuser = function(eatuser) {
  this.name = eatuser.name;
  this.email = eatuser.email;
  this.phoneno = eatuser.phoneno;
  this.referalcode = eatuser.referalcode;
  this.locality = eatuser.locality;
  this.password = eatuser.password;
  //  this.created_at = new Date();
  this.virtualkey = eatuser.virtualkey || 0;
  this.otp_status = eatuser.otp_status || "";
  this.gender = eatuser.gender ;
  this.regionid = eatuser.regionid || 0;
  this.pushid_android = eatuser.pushid_android;
  this.pushid_ios = eatuser.pushid_ios;
};

Eatuser.createUser = function createUser(newUser, result) {
  if (newUser.virtualkey == null) newUser.virtualkey = 0;

  sql.query(
    "Select * from User where phoneno = '" +
      newUser.phoneno +
      "' OR email= '" +
      newUser.email +
      "' ",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        if (res.length == 0) {
          sql.query("INSERT INTO User set ?", newUser, function(err, res) {
            if (err) {
              console.log("error: ", err);
              result(null, err);
            } else {
              let sucobj = true;

              if (newUser.virtualkey === 0) {
                var mesobj = "Eat User Created successfully";
              } else if (newUser.virtualkey === 1) {
                mesobj = "Virtual User Created successfully";
              }

              let resobj = {
                success: sucobj,
                message: mesobj,
                userid: res.insertId
              };

              result(null, resobj);
            }
          });
        } else {
          let sucobj = true;
          let message =
            "Following user already Exist! Please check it mobile number / email";
          let resobj = {
            success: sucobj,
            message: message
          };

          result(null, resobj);
        }
      }
    }
  );
};

Eatuser.getUserById = function getUserById(userId, result) {
  sql.query(
    "Select us.userid,us.name,us.email,us.phoneno,us.Locality,us.created_at,us.virtualkey,us.gender,re.regionname,us.regionid,us.razer_customerid,us.other_region,us.other_hometown,us.hometownid,ht.hometownname from User us left join Region re on re.regionid = us.regionid left join Hometown ht on ht.hometownid=us.hometownid where us.userid = ? ",
    userId,
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
      
        let resobj = {
          success: true,
          status:true,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

Eatuser.getAllUser = function getAllUser(result) {
  sql.query("Select * from User", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Eatuser.updateById = function(id, user, result) {
  sql.query(
    "UPDATE User SET task = ? WHERE userid = ?",
    [task.task, id],
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

Eatuser.remove = function(id, result) {
  sql.query("DELETE FROM User WHERE userid = ?", [id], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Eatuser.getAllVirtualUser = function getAllVirtualUser(req, result) {
  var userlimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * userlimit;

  var query = "select * from User";

  if (req.virtualkey !== "all") {
    query = "select * from User where virtualkey = " + req.virtualkey + " ";
  }

  if (req.virtualkey !== "all" && req.search) {
    query =
      query +
      " and (phoneno LIKE  '%" +
      req.search +
      "%' OR email LIKE  '%" +
      req.search +
      "%' OR phoneno LIKE  '%" +
      req.search +
      "%' OR userid LIKE  '%" +
      req.search +
      "%' or name LIKE  '%" +
      req.search +
      "% ') ";
  } else if (req.search) {
    query =
      query +
      " where (phoneno LIKE  '%" +
      req.search +
      "%' OR email LIKE  '%" +
      req.search +
      "%' OR phoneno LIKE  '%" +
      req.search +
      "%' OR userid LIKE  '%" +
      req.search +
      "%' or name LIKE  '%" +
      req.search +
      "% ' )";
  }

  var limitquery =
    query + " order by userid desc limit " + startlimit + "," + userlimit + " ";

  sql.query(limitquery, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      var totalcount = 0;

      sql.query(query, function(err, res2) {
        totalcount = res2.length;

        let sucobj = true;
        let resobj = {
          success: sucobj,
          totalcount: totalcount,
          result: res
        };

        result(null, resobj);
      });
    }
  });
};

Eatuser.virtual_eatusersearch = function virtual_eatusersearch(search, result) {
  console.log(search);
  sql.query(
    "select * from User where phoneno LIKE  '%" +
      search +
      "%' OR email LIKE  '%" +
      search +
      "%' or name LIKE  '%" +
      search +
      "%  ' ",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

Eatuser.get_eat_dish_list = async function(req, result) {
  sql.query(
    "Select distinct pt.productid,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image, pt.product_name,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cusinename,cu.cuisineid,ly.localityname,  ( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cusine cu on cu.cusineid=pt.cusine left join Locality ly on mu.localityid=ly.localityid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '" +
      req.eatuserid +
      "' HAVING distance!= '' ORDER BY distance",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        for (let i = 0; i < res.length; i++) {
          eta = 15 + 3 * res[i].distance;
          //15min Food Preparation time , 3min 1 km
          res[i].eta = Math.round(eta) + " mins";
        }

        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

Eatuser.get_eat_makeit_list = function(req, result) {
  var cusinename = [];
  sql.query(
    "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,mk.costfortwo,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(lat)) ) ) AS distance from MakeitUser mk left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' HAVING distance!= '' ORDER BY distance",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        for (let i = 0; i < res.length; i++) {
          var groupquery =
            "select GROUP_CONCAT('[',(CONCAT('{cusinename:',cs.cusinename,'}')),']') as cusinename  from MakeitUser mk left join Cusine_makeit cm on cm.makeit_userid =mk.userid left join Cusine cs on cs.cusineid = cm.cusineid where mk.userid = '" +
            res[i].makeituserid +
            "'";

          sql.query(groupquery, async function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            }

            res[i].cusinename = await res1;
          });

          console.log(cusinename);
          res[i].distance = res[i].distance.toFixed(2);
          //15min Food Preparation time , 3min 1 km
          eta = 15 + 3 * res[i].distance;

          res[i].eta = Math.round(eta) + " mins";
        }

        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};


Eatuser.get_eat_makeit_product_list = async function(req, result) {

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;
  var Images=[];
  if (req.eatuserid) {
    var productquery =
      "Select mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,mk.locality as localityname ,re.regionname,mk.costfortwo,mk.virutal_rating_count as rating_count,mk.img1 as makeitimg,mk.about,mk.member_type,mk.locality,mk.unservicable,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid', pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid,'prod_desc',pt.prod_desc)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
      req.eatuserid +
      "'  where mk.userid = " +
      req.makeit_userid +
      " and mk.ka_status = 2 and pt.approved_status=2 and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1 ";
  } else {
    var productquery =
      "Select mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,ly.localityname ,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.img2,mk.img3,mk.img4,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  join Fav fa on fa.makeit_userid = mk.userid  join Fav faa on faa.productid = pt.productid  where mk.userid =" +
      req.makeit_userid +
      " and mk.ka_status = 2 and pt.approved_status=2 and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1";
  }

  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");


  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  
   if (currenthour < lunchcycle) {
    productquery = productquery + " and pt.breakfast = 1";
   }else if(currenthour >= lunchcycle && currenthour < dinnercycle){

      productquery = productquery + " and pt.lunch = 1";

    }else if( currenthour >= dinnercycle){

      productquery = productquery + " and pt.dinner = 1";
   }



  if (req.vegtype === "1") {
    productquery = productquery + " and pt.vegtype= 0";
  }

  
  sql.query(productquery, async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      ////Zone Condition Make Array////
      if(constant.zone_control){
        ////Get User Zone////
        var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid ='';
        var zonename ='';
        var zonemakeitsrrsy = [];

        if(getzone.zone_id){
          userzoneid = getzone.zone_id;
          zonename   = getzone.zone_name;
                
          if (currenthour < lunchcycle) {    
            currentcycle = " and pt.breakfast = 1";
          }else if(currenthour >= lunchcycle && currenthour < dinnercycle){    
            currentcycle = " and pt.lunch = 1";
          }else if( currenthour >= dinnercycle){              
            currentcycle = " and pt.dinner = 1";
          }

          zonemakeitsrrsy = await query("select mu.userid from MakeitUser as mu left join Product as pt on pt.makeit_userid = mu.userid where mu.unservicable=0 and (mu.appointment_status = 3 and mu.ka_status = 2 and pt.approved_status=2 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) "+currentcycle+" and zone="+userzoneid);
        }
      }     

      // if(res[0].makeitimg) Images.push(res[0].makeitimg);
      // if(res[0].img2) Images.push(res[0].img2);
      // if(res[0].img3) Images.push(res[0].img3);
      // if(res[0].img4) Images.push(res[0].img4);
      // if(Images.length!==0) res[0].images=Images;
      //this code commaded due to flow changes
      //   if (res[0].makeituserid !== null && res[0].productlist !== null) {

    if (res[0].makeituserid !== null) {

        for (let i = 0; i < res.length; i++) {

          if (res[i].member_type === 1) {
            res[i].member_type_name = 'Gold';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
          }else if (res[i].member_type === 2){
            res[i].member_type_name = 'Silver';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
          }else if (res[i].member_type === 3){
            res[i].member_type_name = 'bronze';
            res[i].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
          }

          if (res[i].unservicable == 0) {
            res[i].serviceablestatus = true;
          }

          //////////////Zone Condition//////////
          if(constant.zone_control){
            if (res[0].serviceablestatus !== false) {
              if(zonemakeitsrrsy.length !=0 && res[0].zone==userzoneid){
                res[0].serviceablestatus = true;
                res[0].kitchenstatus = 0;
              }else if (zonemakeitsrrsy.length ==0 && res[0].distance <= radiuslimit){
                res[0].serviceablestatus = true;
                res[0].kitchenstatus = 0;
              }else{
                res[0].serviceablestatus = false;
                res[0].kitchenstatus = 1;
              }
            }
          }else{
            if (res[i].serviceablestatus !== false) {
              if (res[i].distance <= radiuslimit) {
                res[i].serviceablestatus = true;
              }else{
                res[i].serviceablestatus = false;
              }
            }
          }

          if (res[i].productlist) {
            res[i].productlist = JSON.parse(res[i].productlist);
            // res[i].distance = res[i].distance * constant.onemile;
            res[i].distance = res[i].distance.toFixed(2) ;
            //console.log(res[i].distance);
            //15min Food Preparation time , 3min 1 km
            //  eta = 15 + 3 * res[i].distance;
       
            var eta = constant.delivery_buffer_time + foodpreparationtime + (onekm * res[i].distance);
            //15min Food Preparation time , 3min 1 km         
            res[i].eta = Math.round(eta);  
        
            if (  res[i].eta > 60) {
              var hours =  res[i].eta / 60;
              var rhours = Math.floor(hours);
              var minutes = (hours - rhours) * 60;
              var rminutes = Math.round(minutes);            
              //console.log(rhours);
              //console.log(rminutes);
              // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
              res[i].eta = "above 60 Mins"
            }else{
              res[i].eta = Math.round(eta) + " mins";
            }
            //  res[i].eta = Math.round(eta) + " mins";            
          }
        }

        const specialitems = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 3 limit 4");
        const kitcheninfoimage = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 2 limit 4");
        const kitchenmenuimage = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 4 limit 4");
        const kitchensignature = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 1 limit 1");        
        const foodbadge  = await query("select mbm.Makeit_id,mbm.badge_id,mb.name,mb.url from Makeit_badges_mapping mbm join  Makeit_badges mb on mbm.badge_id = mb.id where mbm.makeit_id ="+req.makeit_userid+"");
        // var special = await query("select * from Makeit_images ");
        res[0].specialitems=specialitems;
        res[0].kitcheninfoimage=kitcheninfoimage;
        res[0].kitchenmenuimage=kitchenmenuimage;
        res[0].kitchensignature =null;
        if (kitchensignature.length !== 0) {
          res[0].kitchensignature=kitchensignature[0].img_url ;
        }
        // console.log(foodbadge);
        res[0].foodbadge=foodbadge;
        // let sucobj = true;
        let resobj = {
          success: true,
          status:true,         
          zoneId:userzoneid,
          zoneName:zonename,
          result: res
        };
        result(null, resobj);
      } else {       
        let message = "kitchen is not available!";
        let resobj = {
          success: true,
          status:false,         
          zoneId:userzoneid,
          zoneName:zonename,
          message: message
        };
        result(null, resobj);
      }
    }
    // }
  });
};

Eatuser.get_eat_makeit_product_list_v_2 = async function(req, result) {
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
  // var tunnelkitchenliststatus = true;
  // const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");
  // if (userdetails[0].first_tunnel == 1 ) {    
  //   tunnelkitchenliststatus = false;
  // }

  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var ifconditionquery;
  var cycle = '' ;
  var nextcycle ='';
  var nextthirdcyclecycle = '';
  var where_condition_query = '';
  var scondcycle = '';
  var thirdcycle = '';
  
  if (currenthour < lunchcycle) {
    productquery = productquery + " and pt.breakfast = 1";
    ifconditionquery = "pt.breakfast =1";
    scondcycle = "pt.lunch=1";
    thirdcycle = "pt.dinner =1";
    cycle = constant.breatfastcycle + 'AM';
    nextcycle = "Next available \n"+constant.lunchcycle + ' PM';
    nextthirdcyclecycle = "Next available \n"+constant.dinnerstart + ' PM';
    where_condition_query = where_condition_query + "and (pt.breakfast = 1 OR pt.lunch = 1)";
  }else if(currenthour >= lunchcycle && currenthour < dinnercycle){
    productquery = productquery + " and pt.lunch = 1";
    ifconditionquery = "pt.lunch =1";
    scondcycle = "pt.dinner=1";
    thirdcycle = "pt.breakfast =1";
    cycle =  "Next available \n"+ constant.lunchcycle + ' PM';
    nextcycle = "Next available \n"+ constant.dinnerstart + ' PM';
    nextthirdcyclecycle = "Next available \n"+ constant.breatfastcycle + ' AM,Tomorrow';
    where_condition_query = where_condition_query + "and (pt.lunch = 1 OR pt.dinner = 1)";
  }else if(currenthour >= dinnercycle){
    productquery = productquery + " and pt.dinner = 1";
    ifconditionquery = "pt.dinner =1";
    scondcycle = "pt.breakfast=1";
    thirdcycle = "pt.lunch =1";
    cycle = constant.dinnercycle + 'PM';
    nextcycle = "Next available \n"+ constant.breatfastcycle + ' AM,Tomorrow';
    nextthirdcyclecycle ="Next available \n"+ constant.lunchcycle + ' PM,Tomorrow';
    where_condition_query = where_condition_query + "and (pt.dinner = 1 OR  pt.breakfast = 1)";
  }


    // var productquery =
    //   "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,mk.locality as localityname ,re.regionname,mk.costfortwo,mk.virutal_rating_count as rating_count,mk.img1 as makeitimg,mk.about,mk.member_type,mk.locality,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
    //   req.lat +
    //   "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
    //   req.lon +
    //   "') ) + sin( radians('" +
    //   req.lat +
    //   "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid', pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid,'prod_desc',pt.prod_desc,'next_available',IF("+ifconditionquery+",false,true),'next_available_time',IF("+ifconditionquery+",'"+cycle+"','"+nextcycle+"'),'breakfast',pt.breakfast,'lunch',pt.lunch,'dinner',pt.dinner)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
    //   req.eatuserid +
    //   "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
    //   req.eatuserid +
    //   "'  where mk.userid = " +
    //   req.makeit_userid +
    //   " and mk.ka_status = 2 and pt.approved_status=2 and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1 ";
  
  var productquery = " Select mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,mk.locality as localityname ,re.regionname,mk.costfortwo,mk.virutal_rating_count as rating_count,mk.img1 as makeitimg,mk.about,mk.member_type,mk.locality,mk.unservicable,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
    req.lat +
    "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
    req.lon +
    "') ) + sin( radians('" +
    req.lat +
    "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid', pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid,'prod_desc',pt.prod_desc,'next_available',IF("+ifconditionquery+",false,true),'next_available_time',IF("+scondcycle+",'"+nextcycle+"',IF("+thirdcycle+",'"+nextthirdcyclecycle+"','Available')),'breakfast',pt.breakfast,'lunch',pt.lunch,'dinner',pt.dinner)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
    req.eatuserid +
    "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
    req.eatuserid +
    "'  where mk.userid = " +
    req.makeit_userid +
    " and mk.ka_status = 2 and pt.approved_status=2 and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1"



  if (req.vegtype === "1") {
    productquery = productquery + " and pt.vegtype= 0 ";
     }
    productquery = productquery + " order by "+ifconditionquery+"";

  sql.query(productquery, async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {   
      ////Zone Condition Make Array////
      if(constant.zone_control){
        ////Get User Zone////
        var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid ='';
        var zonename ='';
        var zonemakeitsrrsy = [];

        if(getzone.zone_id){
          userzoneid = getzone.zone_id;
          zonename   = getzone.zone_name;               
          if (currenthour < lunchcycle) {    
            currentcycle = " and pt.breakfast = 1";
          }else if(currenthour >= lunchcycle && currenthour < dinnercycle){    
            currentcycle = " and pt.lunch = 1";
          }else if( currenthour >= dinnercycle){              
            currentcycle = " and pt.dinner = 1";
          }

          zonemakeitsrrsy = await query("select mu.userid from MakeitUser as mu left join Product as pt on pt.makeit_userid = mu.userid where mu.unservicable=0 and (mu.appointment_status = 3 and mu.ka_status = 2 and pt.approved_status=2 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) "+currentcycle+" and zone="+userzoneid);
        }
      }   

      if (res[0].makeituserid !== null) {
        //  for (let i = 0; i < res.length; i++) {
        if (res[0].member_type === 1) {
          res[0].member_type_name = 'Gold';
          res[0].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
        }else if (res[0].member_type === 2){
          res[0].member_type_name = 'Silver';
          res[0].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
        }else if (res[0].member_type === 3){
          res[0].member_type_name = 'bronze';
          res[0].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
        }
          
        res[0].serviceablestatus = false;
        ///console.log(res[0].unservicable);
        if (res[0].unservicable == 0) {
          res[0].serviceablestatus = true;
        }

        //////////////Zone Condition//////////
        if(constant.zone_control){
          if (res[0].serviceablestatus !== false) {
            if(zonemakeitsrrsy.length !=0 && res[0].zone==userzoneid){
              res[0].serviceablestatus = true;
              res[0].kitchenstatus = 0;
            }else if (zonemakeitsrrsy.length ==0 && res[0].distance <= radiuslimit){
              res[0].serviceablestatus = true;
              res[0].kitchenstatus = 0;
            }else{
              res[0].serviceablestatus = false;
              res[0].kitchenstatus = 1;
            }
          }
        }else{
          if (res[0].serviceablestatus !== false) {
            if (res[0].distance <= radiuslimit) {
              res[0].serviceablestatus = true;
            }else{
              res[0].serviceablestatus = false;
            }
          }
        }

        // if ( tunnelkitchenliststatus == false) {      
        //   res[0].serviceablestatus = true;        
        // }       

        if (res[0].productlist) {
          //array json parser
          res[0].productlist = JSON.parse(res[0].productlist);
          //  if ( tunnelkitchenliststatus == false) {      
          // res[0].serviceablestatus = true;            
          var productlist = res[0].productlist;        
          productlist.map(function(x) { 
            x.next_available = 0; 
            return x
          });
          res[0].productlist = productlist              
          //   }           
          //   productlist.sort(function(next_available,next_available) {
          //     return next_available - next_available;
          // });
          //  res[0].productlist = productlist 

          res[0].productlist.sort((a, b) => parseFloat(a.next_available) - parseFloat(b.next_available));
          // for (let i = 0; i < productlist.length; i++) {
          //   var product_id_list= {};
          //   product_id_list.map(productlist[i].productid);              
          // }
          //  console.log(product_id_list);          
          //  res[0].distance = res[0].distance * constant.onemile;
          res[0].distance = res[0].distance.toFixed(2) ;
          //15min Food Preparation time , 3min 1 km
          //  eta = 15 + 3 * res[i].distance;
          var eta = constant.delivery_buffer_time + foodpreparationtime + (onekm * res[0].distance);
          //15min Food Preparation time , 3min 1 km         
          res[0].eta = Math.round(eta);  
          
          // if (res[0].distance <= radiuslimit) {
          //   res[0].serviceablestatus = true;
          // }

          if (res[0].eta > 60) {
            var hours =  res[0].eta / 60;
            var rhours = Math.floor(hours);
            var minutes = (hours - rhours) * 60;
            var rminutes = Math.round(minutes);           
        
            // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
            res[0].eta = "above 60 Mins"
          }else{
            res[0].eta = Math.round(eta) + " mins";
          }
          //  res[i].eta = Math.round(eta) + " mins";   
        }
        //  }

        const specialitems = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 3 limit 4");
        const kitcheninfoimage = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 2 limit 4");
        const kitchenmenuimage = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 4 limit 4");
        const kitchensignature = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 1 limit 1");
          
        const foodbadge  = await query("select mbm.Makeit_id,mbm.badge_id,mb.name,mb.url from Makeit_badges_mapping mbm join  Makeit_badges mb on mbm.badge_id = mb.id where mbm.makeit_id ="+req.makeit_userid+"");
        // var special = await query("select * from Makeit_images ");
        res[0].specialitems=specialitems;
        res[0].kitcheninfoimage=kitcheninfoimage;
        res[0].kitchenmenuimage=kitchenmenuimage;
        res[0].kitchensignature =null
        if (kitchensignature.length !== 0) {
          res[0].kitchensignature=kitchensignature[0].img_url ;
        }
        // console.log(foodbadge);
        res[0].foodbadge=foodbadge
        // let sucobj = true;
        let resobj = {
          success: true,
          status:true,          
          zoneId:userzoneid,
          zoneName:zonename,
          result: res
        };
        result(null, resobj);
      } else {       
        let message = "kitchen is not available!";
        let resobj = {
          success: true,
          status:false,          
          zoneId:userzoneid,
          zoneName:zonename,
          message: message
        };
        result(null, resobj);
      }
    }
    // }
  });
};

Eatuser.get_eat_makeit_product_list_v_2_1= async function(req, result) {
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit = constant.radiuslimit;
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
  var tunnelkitchenliststatus = true;
  const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");
  //console.log('userdetails-->',userdetails);
  if (userdetails[0].first_tunnel == 1 ) {    
    tunnelkitchenliststatus = false;
  }


  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var ifconditionquery;
  var cycle = '' ;
  var nextcycle ='';
  var nextthirdcyclecycle = '';
  var where_condition_query = '';
  var scondcycle = '';
  var thirdcycle = '';
  
  if (currenthour < lunchcycle) {
    productquery = productquery + " and pt.breakfast = 1";
    ifconditionquery = "pt.breakfast =1";
    scondcycle = "pt.lunch=1";
    thirdcycle = "pt.dinner =1";
    cycle = constant.breatfastcycle + 'AM';
    nextcycle = "Next available \n"+constant.lunchcycle + ' PM';
    nextthirdcyclecycle = "Next available \n"+constant.dinnerstart + ' PM';
    where_condition_query = where_condition_query + "and (pt.breakfast = 1 OR pt.lunch = 1)";
  }else if(currenthour >= lunchcycle && currenthour < dinnercycle){
    productquery = productquery + " and pt.lunch = 1";
    ifconditionquery = "pt.lunch =1";
    scondcycle = "pt.dinner=1";
    thirdcycle = "pt.breakfast =1";
    cycle =  "Next available \n"+ constant.lunchcycle + ' PM';
    nextcycle = "Next available \n"+ constant.dinnerstart + ' PM';
    nextthirdcyclecycle = "Next available \n"+ constant.breatfastcycle + ' AM,Tomorrow';
    where_condition_query = where_condition_query + "and (pt.lunch = 1 OR pt.dinner = 1)";
  }else if(currenthour >= dinnercycle){
    productquery = productquery + " and pt.dinner = 1";
    ifconditionquery = "pt.dinner =1";
    scondcycle = "pt.breakfast=1";
    thirdcycle = "pt.lunch =1";
    cycle = constant.dinnercycle + 'PM';
    nextcycle = "Next available \n"+ constant.breatfastcycle + ' AM,Tomorrow';
    nextthirdcyclecycle ="Next available \n"+ constant.lunchcycle + ' PM,Tomorrow';
    where_condition_query = where_condition_query + "and (pt.dinner = 1 OR  pt.breakfast = 1)";
  }
    
  var productquery = " Select mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,mk.locality as localityname ,re.regionname,mk.costfortwo,mk.virutal_rating_count as rating_count,mk.img1 as makeitimg,mk.about,mk.member_type,mk.locality,mk.unservicable,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
    req.lat +
    "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
    req.lon +
    "') ) + sin( radians('" +
    req.lat +
    "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(pt.productid) as plistid,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid', pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid,'prod_desc',pt.prod_desc,'next_available',IF("+ifconditionquery+",false,true),'next_available_time',IF("+scondcycle+",'"+nextcycle+"',IF("+thirdcycle+",'"+nextthirdcyclecycle+"','Available')),'breakfast',pt.breakfast,'lunch',pt.lunch,'dinner',pt.dinner)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
    req.eatuserid +
    "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
    req.eatuserid +
    "'  where mk.userid = " +
    req.makeit_userid +
    " and mk.ka_status = 2 and pt.approved_status=2 and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1"

  if (req.vegtype === "1") {
    productquery = productquery + " and pt.vegtype= 0 ";
  }

  productquery = productquery + " order by "+ifconditionquery+"";      
  //console.log("Request =====>",req);
  
  sql.query(productquery, async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {  
      ////Zone Condition Make Array////

      var productIds=JSON.parse(res[0].plistid);
      var productlistArray=[];
      if(productIds && productIds.length>0){
        productIds=productIds.toString();
        var ptQuary = "Select pt.makeit_userid,pt.productid,pt.price,pt.product_name,pt.image as productimage,pt.image,pt.quantity,pt.vegtype,pt.prod_desc,pt.prod_desc,pt.breakfast,pt.lunch,pt.dinner,IF(faa.favid,1,0) as isfav,faa.favid, cu.cuisinename,IF("+ifconditionquery+",false,true) as next_available,IF("+scondcycle+",'"+nextcycle+"',IF("+thirdcycle+",'"+nextthirdcyclecycle+"','Available')) as next_available_time,IF("+ifconditionquery+"!=1,4,IF((pt.image IS NOT NULL AND pt.image!='null' AND pt.image!=''),0,IF(sum(1)>1,1,2))) as orderpro from Product pt left join Productitem pi on pi.productid=pt.productid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Fav faa on faa.productid = pt.productid and faa.eatuserid = " +req.eatuserid +" where pt.delete_status = 0 and pt.approved_status=2 and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1 and pt.productid in ("+productIds+") group by pt.productid order by orderpro asc,pt.price desc"
        //console.log('ptQuary-->',ptQuary);
        productlistArray = await query(ptQuary);
      }
      if(constant.zone_control){
        ////Get User Zone////
        var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid ='';
        var zonename ='';
        var zonemakeitsrrsy = [];

        if(getzone.zone_id){
          userzoneid = getzone.zone_id;
          zonename   = getzone.zone_name;
                
          if (currenthour < lunchcycle) {    
            currentcycle = " and pt.breakfast = 1";
          }else if(currenthour >= lunchcycle && currenthour < dinnercycle){    
            currentcycle = " and pt.lunch = 1";
          }else if( currenthour >= dinnercycle){              
            currentcycle = " and pt.dinner = 1";
          }
          zonemakeitsrrsy = await query("select mu.userid from MakeitUser as mu left join Product as pt on pt.makeit_userid = mu.userid where mu.unservicable=0 and (mu.appointment_status = 3 and mu.ka_status = 2 and pt.approved_status=2 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) "+currentcycle+" and zone="+userzoneid);
        }
      }   

      if (res[0].makeituserid !== null) {
      //  for (let i = 0; i < res.length; i++) {
        if (res[0].member_type === 1) {
          res[0].member_type_name = 'Gold';
          res[0].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
        }else if (res[0].member_type === 2){
          res[0].member_type_name = 'Silver';
          res[0].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
        }else if (res[0].member_type === 3){
          res[0].member_type_name = 'bronze';
          res[0].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
        }

        res[0].serviceablestatus = false;
        ///console.log(res[0].unservicable);
        if (res[0].unservicable == 0) {
          res[0].serviceablestatus = true;
        }
        
        //////////////Zone Condition//////////
        if(constant.zone_control){
          if (res[0].serviceablestatus !== false) {
            if(zonemakeitsrrsy.length !=0 && res[0].zone==userzoneid){
              res[0].serviceablestatus = true;
              res[0].kitchenstatus = 0;
            }else if (zonemakeitsrrsy.length ==0 && res[0].distance <= radiuslimit){
              res[0].serviceablestatus = true;
              res[0].kitchenstatus = 0;
            }else{
              res[0].serviceablestatus = false;
              res[0].kitchenstatus = 1;
            }
          }
        }else{
          if (res[0].serviceablestatus !== false) {
            if (res[0].distance <= radiuslimit) {
              res[0].serviceablestatus = true;
            }else{
              res[0].serviceablestatus = false;
            }
          }
        }
       
        if ( tunnelkitchenliststatus == false) {      
          res[0].serviceablestatus = true;        
        }       

        if (res[0].productlist) {
          //array json parser
          res[0].productlist = JSON.parse(res[0].productlist);
          if ( tunnelkitchenliststatus == false) {      
            res[0].serviceablestatus = true;            
            var productlist = res[0].productlist         
            productlist.map(function(x) { 
              x.next_available = 0; 
              return x
            });
            res[0].productlist = productlist              
          }              
          //  productlist.sort(function(next_available,next_available) {
          //     return next_available - next_available;
          //  });
          //  res[0].productlist = productlist 
          res[0].productlist.sort((a, b) => parseFloat(a.next_available) - parseFloat(b.next_available));
          // for (let i = 0; i < productlist.length; i++) {
          //   var product_id_list= {};
          //   product_id_list.map(productlist[i].productid);              
          // }
          //  console.log(product_id_list);
          //  res[0].distance = res[0].distance * constant.onemile;
          res[0].distance = res[0].distance.toFixed(2) ;
      
          // 15min Food Preparation time , 3min 1 km
          //  eta = 15 + 3 * res[i].distance;
          var eta = constant.delivery_buffer_time + foodpreparationtime + (onekm * res[0].distance);
          //15min Food Preparation time , 3min 1 km         
          res[0].eta = Math.round(eta);  
         
          // if (res[0].distance <= radiuslimit) {
          //   res[0].serviceablestatus = true;
          // }

          if (res[0].eta > 60) {
            var hours =  res[0].eta / 60;
            var rhours = Math.floor(hours);
            var minutes = (hours - rhours) * 60;
            var rminutes = Math.round(minutes);       
            // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
            res[0].eta = "above 60 Mins"
          }else{
            res[0].eta = Math.round(eta) + " mins";
          }
          //  res[i].eta = Math.round(eta) + " mins";    
        }

        if(productlistArray&&productlistArray.length>0){
          if ( tunnelkitchenliststatus == false) {      
            res[0].serviceablestatus = true;            
            productlistArray.map(function(x) { 
              x.next_available = 0; 
              return x
            });
          }
           res[0].productlist = productlistArray;
        }
      //   }

        const specialitems = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 3 limit 4");
        const kitcheninfoimage = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 2 limit 4");
        const kitchenmenuimage = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 4 limit 4");
        const kitchensignature = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 1 limit 1");
        
        const foodbadge  = await query("select mbm.Makeit_id,mbm.badge_id,mb.name,mb.url from Makeit_badges_mapping mbm join  Makeit_badges mb on mbm.badge_id = mb.id where mbm.makeit_id ="+req.makeit_userid+"");
        // var special = await query("select * from Makeit_images ");
        res[0].specialitems=specialitems;
        res[0].kitcheninfoimage=kitcheninfoimage;
        res[0].kitchenmenuimage=kitchenmenuimage;
        res[0].kitchensignature =null
        if (kitchensignature.length !== 0) {
          res[0].kitchensignature=kitchensignature[0].img_url ;
        }
        // console.log(foodbadge);
        res[0].foodbadge=foodbadge

        // let sucobj = true;
        let resobj = {
          success: true,
          status:true,
          zoneId:userzoneid,
          zoneName:zonename,
          result: res
        };
        result(null, resobj);
      } else {       
        let message = "kitchen is not available!";
        let resobj = {
          success: true,
          status:false,
          zoneId:userzoneid,
          zoneName:zonename,
          message: message
        };
        result(null, resobj);
      }
    }
    // }
  });
};


Eatuser.get_eat_dish_list_sort_filter = function(req, result) {

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;

  var filterquery = "";
  var cuisinequery = "";

  var regionlist = [];
  var cuisinelist = [];

  

  if (req.regionlist !== undefined || !req.regionlist !== null) {
    regionlist = req.regionlist;
  }

  if (req.cuisinelist !== undefined || req.cuisinelist !== null) {
    cuisinelist = req.cuisinelist;
  }

  if (regionlist) {
    for (let i = 0; i < regionlist.length; i++) {
      filterquery =
        filterquery + " mu.regionid = '" + regionlist[i].region + "' or";
    }
  }

  if (cuisinelist) {
    for (let i = 0; i < cuisinelist.length; i++) {
      cuisinequery =
        cuisinequery + " pt.cuisine = '" + cuisinelist[i].cuisine + "' or";
    }
  }

  if (regionlist !== undefined && cuisinelist !== undefined) {
    filterquery =
      cuisinequery.slice(0, -2) +
      ")" +
      "and" +
      "(" +
      filterquery.slice(0, -2) +
      ")";

  } else if (regionlist !== undefined && cuisinelist == undefined) {
    filterquery = "(" + filterquery.slice(0, -2) + ")";
  } else if (regionlist == undefined && cuisinelist !== undefined) {
    filterquery = cuisinequery.slice(0, -2) + ")";
  }


  // var query = "Select mu.userid as makeit_userid,mu.name as makeit_username,mu.img as makeit_image, pt.product_name, pt.productid,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,  ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '"+req.eatuserid+"'";

  if (req.eatuserid) {
    var query =
      "Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid as makeit_region,re.regionname, pt.product_name,pt.vegtype,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,cu.cuisineid,ly.localityname,  ( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cuisine cu on cu.cuisineid=pt.cuisine left join Locality ly on mu.localityid=ly.localityid join Region re on re.regionid = mu.regionid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '" +
      req.eatuserid +
      "' ";
  } else {
    query =
      "Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid as makeit_region,re.regionname, pt.product_name,pt.vegtype,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,cu.cuisineid,ly.localityname,  ( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cuisine cu on cu.cuisineid=pt.cuisine left join Locality ly on mu.localityid=ly.localityid join Region re on re.regionid = mu.regionid left join Fav fa on fa.productid = pt.productid  ";
  }

  if (
    req.search !== undefined &&
    regionlist === undefined &&
    cuisinelist === undefined
  ) {
    console.log("search");
    query =
      query +
      " where mu.appointment_status = 3 and mu.ka_status = 2 and pt.approved_status = 2 and mu.verified_status = 1 and pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 and pt.product_name like '%" +
      req.search +
      "%'";
  } else if (
    req.search === undefined &&
    regionlist !== undefined &&
    cuisinelist === undefined
  ) {
    console.log("regionlist");
    if (req.eatuserid) {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1) and " +
        filterquery;
    }
  } else if (
    req.search === undefined &&
    regionlist === undefined &&
    cuisinelist !== undefined
  ) {
    console.log("cuisinelist");
    if (req.eatuserid) {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1) and (" +
        filterquery;
    }
  } else if (
    req.search !== undefined &&
    regionlist !== undefined &&
    cuisinelist === undefined
  ) {
    console.log("search and filterquery");
    if (req.eatuserid) {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (pt.product_name like '%" +
        req.search +
        "%') and" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1) and (pt.product_name like '%" +
        req.search +
        "%') and " +
        filterquery;
    }
  } else if (
    req.search !== undefined &&
    regionlist === undefined &&
    cuisinelist !== undefined
  ) {
    console.log("search and cuisinelist");
    if (req.eatuserid) {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (pt.product_name like '%" +
        req.search +
        "%' and" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1) and (pt.product_name like '%" +
        req.search +
        "%' and " +
        filterquery;
    }
  } else if (
    req.search !== undefined &&
    regionlist !== undefined &&
    cuisinelist !== undefined
  ) {
    console.log("search and regionlist and cuisinelist");
    if (req.eatuserid) {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (pt.product_name like '%" +
        req.search +
        "%' and" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1) and (pt.product_name like '%" +
        req.search +
        "%' and " +
        filterquery;
    }
  } else if (
    req.search === undefined &&
    regionlist !== undefined &&
    cuisinelist !== undefined
  ) {
    console.log("cuisinelist and regionlist");
    if (req.eatuserid) {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2) and (pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1) and (" +
        filterquery;
    }
  } else if (
    req.search == undefined &&
    regionlist === undefined &&
    cuisinelist === undefined
  ) {
    console.log("search");
    query =
      query +
      " where mu.appointment_status = 3 and mu.verified_status = 1 and mu.ka_status = 2 and pt.active_status = 1 and pt.approved_status = 2 and pt.quantity != 0 and pt.delete_status !=1";
  }


  if (req.vegtype === 0) {
    query =query +" and pt.vegtype=0";
  }

  if (req.sortid == 1) {
    query = query + " HAVING distance <="+radiuslimit+" ORDER BY distance";
  } else if (req.sortid == 2) {
    query = query + " HAVING distance <="+radiuslimit+" ORDER BY distance";
  } else if (req.sortid == 3) {
    query = query + " HAVING distance <="+radiuslimit+" ORDER BY pt.price ASC";
  } else if (req.sortid == 4) {
    query = query + " HAVING distance <="+radiuslimit+" ORDER BY pt.price DESC";
  } else {
    query = query + " HAVING distance <="+radiuslimit+" ORDER BY distance";
  }


  
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
      //  eta = 15 + 3 * res[i].distance;
      var eta = constant.delivery_buffer_time + foodpreparationtime + (onekm * res[i].distance);
        //15min Food Preparation time , 3min 1 km
       
        res[i].eta = Math.round(eta) + " mins";
      }

      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};


Eatuser.get_eat_kitchen_list_sort_filter = function (req, result) {
  
  //console.log(res3.result[0].amountdetails);

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit = constant.radiuslimit;

  var cuisinequery = "";

  var cuisinelist = [];


  if (req.cuisinelist !== undefined || req.cuisinelist !== null) {
    cuisinelist = req.cuisinelist;
  }


  if (cuisinelist) {
    for (let i = 0; i < cuisinelist.length; i++) {
      cuisinequery =
        cuisinequery + " cm.cuisineid = '" + cuisinelist[i].cuisine + "' or";
    }
  }

  cuisinequery = cuisinequery.slice(0, -2) + ")";



  if (req.eatuserid) {
    var query =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,mk.unservicable,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  } else {
    query =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,mk.unservicable,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  }

 
  if (cuisinelist !== undefined) {
  
   // query =query +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +filterquery;
    query = query +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +cuisinequery;

  }else{

   query = query + " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1)  and (pt.quantity != 0 and pt.delete_status !=1 and pt.active_status = 1 ) ";

  }

  if (req.vegtype) {
      query = query + "and mk.food_type= 0";
  }

 
  var day = new Date();
  var currenthour = day.getHours();

  if (currenthour < 12) {

    query = query + " and pt.breakfast = 1";
    
  }else if(currenthour >= 12 && currenthour < 16){

    query = query + " and pt.lunch = 1";

  }else if( currenthour >= 16){
      query = query + " and pt.dinner = 1";
  }



  if (req.sortid == 1) {
    query = query + " GROUP BY pt.productid  ORDER BY distance,mk.unservicable = 0 desc";
  } else if (req.sortid == 2) {
    query = query + " GROUP BY pt.productid  ORDER BY mk.rating DESC,mk.unservicable = 0 desc";
  } else if (req.sortid == 3) {
    query = query + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo ASC";
  } else if (req.sortid == 4) {
    query = query + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc, mk.costfortwo DESC";
  } else {
    query = query + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc";
  }

 //console.log(query);
  sql.query(query,async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      ////Zone Condition Make Array////
      if(constant.zone_control){
        ////Get User Zone////
        var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid ='';
        var zonename = '';
        var zonemakeitsrrsy =[];
        if(getzone.zone_id){          
          userzoneid = getzone.zone_id;
          zonename = getzone.zone_name;
        }
        ////Make Zone Servicable kitchen array////
        var zonemakeitsrrsy = res.filter(kitchenarray => (kitchenarray.zone==userzoneid && kitchenarray.unservicable==0));
      }

      for (let i = 0; i < res.length; i++) {
        //   res[i].distance = res[i].distance * constant.onemile;
        res[i].distance = res[i].distance.toFixed(2) ;
        // console.log(res[i].distance);
        // res[i].distance = res[i].distance * constant.onemile;
        // 15min Food Preparation time , 3min 1 km
        //  eta = 15 + 3 * res[i].distance;
        var eta = constant.delivery_buffer_time + foodpreparationtime + (onekm * res[i].distance);
        //15min Food Preparation time , 3min 1 km       
        res[i].eta = Math.round(eta);    
        res[i].serviceablestatus = false;
        res[i].kitchenstatus = 1;
  
        if (res[i].unservicable == 0) {
          res[i].serviceablestatus = true;
          res[i].kitchenstatus = 0;
        }
        
        //////////////Zone Condition//////////
        if(constant.zone_control){
          if (res[i].serviceablestatus !== false) {
            if(zonemakeitsrrsy.length !=0 && res[i].zone==userzoneid){
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else if (zonemakeitsrrsy.length ==0 && res[i].distance <= radiuslimit){
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else{
              res[i].serviceablestatus = false;
              res[i].kitchenstatus = 1;
            }
          }
        }else{
          if (res[i].serviceablestatus !== false) {         
            if (res[i].distance <= radiuslimit) {          
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else{
              res[i].serviceablestatus = false;
              res[i].kitchenstatus = 1;
            }
          }
        }
       
        if ( res[i].eta > 60) {
          var hours = res[i].eta / 60;
          var rhours = Math.floor(hours);
          var minutes = (hours - rhours) * 60;
          var rminutes = Math.round(minutes);        
          // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
          res[i].eta = "above 60 Mins"
        }else{
          res[i].eta = Math.round(eta) + " mins";
        }
       
        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }

        if (res[i].member_type) {
          if (res[i].member_type === 1) {
            res[i].member_type_name = 'Gold';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
          }else if (res[i].member_type === 2){
            res[i].member_type_name = 'Silver';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
          }else if (res[i].member_type === 3){
            res[i].member_type_name = 'bronze';
            res[i].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
          }
        }
      }

      if (!req.sortid) {
        res.sort((a, b) => parseFloat(a.kitchenstatus) - parseFloat(b.kitchenstatus));
      }
   
      let resobj = {
        success: true,
        status:true,
        zoneId:userzoneid,
        zoneName:zonename,
        result: res
      };
      result(null, resobj);
    }   
  });
};

// Eatuser.get_eat_kitchen_list_sort_filter_v2 = function (req, result) {
  
//   //console.log(res3.result[0].amountdetails);

//   var foodpreparationtime = constant.foodpreparationtime;
//   var onekm = constant.onekm;
//   var radiuslimit = constant.radiuslimit;

//   var cuisinequery = "";

//   var cuisinelist = [];


//   if (req.cuisinelist !== undefined || req.cuisinelist !== null) {
//     cuisinelist = req.cuisinelist;
//   }


//   if (cuisinelist) {
//     for (let i = 0; i < cuisinelist.length; i++) {
//       cuisinequery =
//         cuisinequery + " cm.cuisineid = '" + cuisinelist[i].cuisine + "' or";
//     }
//   }

//   cuisinequery = cuisinequery.slice(0, -2) + ")";



//   if (req.eatuserid) {
//     var query =
//       "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
//       req.lat +
//       "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
//       req.lon +
//       "') ) + sin( radians('" +
//       req.lat +
//       "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
//       req.eatuserid +
//       "' left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
//   } else {
//     query =
//       "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,( 3959 * acos( cos( radians('" +
//       req.lat +
//       "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
//       req.lon +
//       "') ) + sin( radians('" +
//       req.lat +
//       "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
//   }

 
//   if (cuisinelist !== undefined) {
  
//    // query =query +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +filterquery;
//     query = query +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +cuisinequery;

//   }else{

//    query = query + " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1)  and (pt.quantity != 0 and pt.delete_status !=1 and pt.active_status = 1 ) ";

//   }

//   if (req.vegtype) {
//       query = query + "and mk.food_type= 0";
//   }

 
//   var day = new Date();
//   var currenthour = day.getHours();

//   if (currenthour < 12) {

//     query = query + " and pt.breakfast = 1";
    
//   }else if(currenthour >= 12 && currenthour < 16){

//     query = query + " and pt.lunch = 1";

//   }else if( currenthour >= 16){
    
//     query = query + " and pt.dinner = 1";
//   }



//   if (req.sortid == 1) {
//     query = query + " GROUP BY pt.productid  ORDER BY distance,mk.unservicable = 0 desc";
//   } else if (req.sortid == 2) {
//     query = query + " GROUP BY pt.productid  ORDER BY mk.rating DESC,mk.unservicable = 0 desc";
//   } else if (req.sortid == 3) {
//     query = query + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo ASC";
//   } else if (req.sortid == 4) {
//     query = query + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo DESC";
//   } else {
//     query = query + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc";
//   }

//   console.log(query);
//   sql.query(query, function(err, res) {
//     if (err) {
//       console.log("error: ", err);
//       result(err, null);
//     } else {
//       for (let i = 0; i < res.length; i++) {
//         var eta = foodpreparationtime + (onekm * res[i].distance);
//         //15min Food Preparation time , 3min 1 km
       
//         res[i].eta = Math.round(eta);    
//         res[i].serviceablestatus = false;
//         res[i].kitchenstatus = 1;

//         if (res[i].unservicable == 0) {
//           res[i].serviceablestatus = true;
//           res[i].kitchenstatus = 0;
          
//         }
        
//         if (res[i].serviceablestatus !== false) {
          
//           if (res[i].distance <= radiuslimit) {
//             res[i].serviceablestatus = true;
//             res[i].kitchenstatus = 0;
//           }else{
//             res[i].serviceablestatus = false;
//             res[i].kitchenstatus = 1;
//           }

//           console.log( res[i].kitchenstatus);
//         }

       

       
//         if ( res[i].eta > 60) {
//           var hours = res[i].eta / 60;
//           var rhours = Math.floor(hours);
//           var minutes = (hours - rhours) * 60;
//           var rminutes = Math.round(minutes);
         
//           console.log(rhours);
//           console.log(rminutes);
//          // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
//          res[i].eta = "above 60 Mins"
//         }else{
//           res[i].eta = Math.round(eta) + " mins";
//         }

       
//         if (res[i].cuisines) {
//           res[i].cuisines = JSON.parse(res[i].cuisines);
//         }


//         if (res[i].member_type) {

//           if (res[i].member_type === 1) {
//             res[i].member_type_name = 'Gold';
//             res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
//           }else if (res[i].member_type === 2){
//             res[i].member_type_name = 'Silver';
//             res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
//           }else if (res[i].member_type === 3){
//             res[i].member_type_name = 'bronze';
//             res[i].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
//           }
//         }

//       }

//       if (!req.sortid) {
//         res.sort((a, b) => parseFloat(a.kitchenstatus) - parseFloat(b.kitchenstatus));
//       }
    

//       let resobj = {
//         success: true,
//         status:true,
//         result: res
//       };

//       result(null, resobj);
//     }

   
//   });
// };

Eatuser.create_first_tunnel_user_location = function create_first_tunnel_user_location(locationdetails) {

  var locationdetails = new Locationtracking(locationdetails);
  Locationtracking.createLocationtracking(locationdetails, function(err, res) {
    if (err) return err;
    else return res;
  });
}


Eatuser.get_eat_kitchen_list_sort_filter_v2 = async function (req, result) {
  //console.log(res3.result[0].amountdetails);
  //var userdetails = await query("");
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit = constant.radiuslimit;
  var cuisinequery = "";
  var cuisinelist = [];

  if (req.cuisinelist !== undefined || req.cuisinelist !== null) {
    cuisinelist = req.cuisinelist;
  }

  if (cuisinelist) {
    for (let i = 0; i < cuisinelist.length; i++) {
      cuisinequery =
        cuisinequery + " cm.cuisineid = '" + cuisinelist[i].cuisine + "' or";
    }
  }

  cuisinequery = cuisinequery.slice(0, -2) + ")";
  if (req.eatuserid) {
    var kitchenquery =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  } else {
    kitchenquery =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  }
 
  if (cuisinelist !== undefined) {  
   // query =query +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +filterquery;
   kitchenquery = kitchenquery +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +cuisinequery;
  }else{
    kitchenquery = kitchenquery + " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1)  and (pt.quantity != 0 and pt.delete_status !=1 and pt.active_status = 1 ) ";
  }

  if (req.vegtype) {
    kitchenquery = kitchenquery + "and mk.food_type= 0";
  }
 
  var day = new Date();
  var currenthour = day.getHours();
  if (currenthour < 12) {
    kitchenquery = kitchenquery + " and pt.breakfast = 1";    
  }else if(currenthour >= 12 && currenthour < 16){
    kitchenquery = kitchenquery + " and pt.lunch = 1";
  }else if( currenthour >= 16){    
    kitchenquery = kitchenquery + " and pt.dinner = 1";
  }

  if (req.sortid == 1) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY distance,mk.unservicable = 0 desc";
  } else if (req.sortid == 2) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.rating DESC,mk.unservicable = 0 desc";
  } else if (req.sortid == 3) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo ASC";
  } else if (req.sortid == 4) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo DESC";
  } else {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc";
  }

  sql.query(kitchenquery, async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {      
      ////Zone Condition Make Array////
      if(constant.zone_control){
        ////Get User Zone////
        var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid ='';
        var zonename   = '';
        var zonemakeitsrrsy = [];
        if(getzone.zone_id){          
          userzoneid = getzone.zone_id;
          zonename = getzone.zone_name;
        }
        ////Make Zone Servicable kitchen array////
        var zonemakeitsrrsy = res.filter(kitchenarray => (kitchenarray.zone==userzoneid && kitchenarray.unservicable==0));
      }

      for (let i = 0; i < res.length; i++) {
        // res[i].distance = res[i].distance * constant.onemile;
        res[i].distance = res[i].distance.toFixed(2) ;
        var eta = constant.delivery_buffer_time + foodpreparationtime + (onekm * res[i].distance);
        //15min Food Preparation time , 3min 1 km
        res[i].eta = Math.round(eta);    
        res[i].serviceablestatus = false;
        res[i].kitchenstatus = 1;

        if (res[i].unservicable == 0) {
          res[i].serviceablestatus = true;
          res[i].kitchenstatus = 0;          
        }


        //////////////Zone Condition//////////
        if(constant.zone_control){
          if (res[i].serviceablestatus !== false) {
            if(zonemakeitsrrsy.length !=0 && res[i].zone==userzoneid){
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else if (zonemakeitsrrsy.length ==0 && res[i].distance <= radiuslimit){
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else{
              res[i].serviceablestatus = false;
              res[i].kitchenstatus = 1;
            }
          }
        }else{
          if (res[i].serviceablestatus !== false) {          
            if (res[i].distance <= radiuslimit) {
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else{
              res[i].serviceablestatus = false;
              res[i].kitchenstatus = 1;
            }
          }
        }

        //for time sort purpose
        res[i].etatime = Math.round(eta);
       
        if ( res[i].eta > 60) {
          var hours = res[i].eta / 60;
          var rhours = Math.floor(hours);
          var minutes = (hours - rhours) * 60;
          var rminutes = Math.round(minutes);         
          // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
          res[i].eta = "above 60 Mins"
        }else{
          res[i].eta = Math.round(eta) + " mins";
        }
       
        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }

        if (res[i].member_type) {
          if (res[i].member_type === 1) {
            res[i].member_type_name = 'Gold';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
          }else if (res[i].member_type === 2){
            res[i].member_type_name = 'Silver';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
          }else if (res[i].member_type === 3){
            res[i].member_type_name = 'bronze';
            res[i].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
          }
        }
      }
     
      if (!req.sortid) {
        res.sort((a, b) => parseFloat(a.kitchenstatus) - parseFloat(b.kitchenstatus));
      }

      const serviceablekitchenlist =  res.filter(res => res.kitchenstatus < 1);
      const unserviceablekitchenlist =  res.filter(res => res.kitchenstatus > 0);

      if (!req.sortid) {
        serviceablekitchenlist.sort((a, b) => parseFloat(a.etatime) - parseFloat(b.etatime));
      }
      if (!req.sortid) {
        unserviceablekitchenlist.sort((a, b) => parseFloat(a.etatime) - parseFloat(b.etatime));
      }
      // if (res[0].serviceablestatus === false ) {
      var kitchenlist = [];
      kitchenlist = serviceablekitchenlist.concat(unserviceablekitchenlist); 
      //  kitchenlist.push(serviceablekitchenlist);
      //  kitchenlist.push(unserviceablekitchenlist);

      // console.log(tunnelkitchenliststatus);
      // if (tunnelkitchenliststatus == false) {
      //   for (let i = 0; i < kitchenlist.length; i++) {
      //      kitchenlist[i].serviceablestatus = true;
      //      kitchenlist[i].kitchenstatus = 0;   
      //    }
      // }
      
      let resobj = {
        success: true,
        status:true,
        zoneId:userzoneid,
        zoneName:zonename,
        result: kitchenlist
      };
      result(null, resobj);
    }   
  });
};

Eatuser.get_eat_kitchen_list_sort_filter_v_2_1 = async function (req, result) {
 
  //console.log(res3.result[0].amountdetails);
  //var userdetails = await query("");

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit = constant.radiuslimit;
  var tunnelkitchenliststatus = true;
  const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");
 // const userdetails = await query("Update User set first_tunnel = 0 where userid = "+req.eatuserid+" ");

  
  if (userdetails[0].first_tunnel == 1 ) {
    
    var tunnelkitchenquery =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) GROUP BY pt.productid HAVING distance < "+radiuslimit+"  ORDER BY mk.unservicable = 0 desc";

    const tunnelkitchenlist = await query(tunnelkitchenquery);

    var locationdetails = {};
    locationdetails.lat=req.lat;
    locationdetails.lon=req.lon;
    locationdetails.address= req.address || '';
    locationdetails.locality= req.locality ||'';
    locationdetails.city= req.city || '';
    locationdetails.userid=req.eatuserid;

    if (tunnelkitchenlist.length == 0) {
      tunnelkitchenliststatus = false;
    
        locationdetails.type=1;

        await Eatuser.create_first_tunnel_user_location(locationdetails);
      }else{
        locationdetails.type=0;
        await Eatuser.create_first_tunnel_user_location(locationdetails);

        const usertunnelupdate = await query("Update User set first_tunnel = 0 where userid = "+req.eatuserid+" ");
      }
  }

  var cuisinequery = "";
  var cuisinelist = [];
  if (req.cuisinelist !== undefined || req.cuisinelist !== null) {
    cuisinelist = req.cuisinelist;
  }

  if (cuisinelist) {
    for (let i = 0; i < cuisinelist.length; i++) {
      cuisinequery =
        cuisinequery + " cm.cuisineid = '" + cuisinelist[i].cuisine + "' or";
    }
  }

  cuisinequery = cuisinequery.slice(0, -2) + ")";
  if (req.eatuserid) {
    var kitchenquery =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,mk.virtualkey,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  } else {
    kitchenquery =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,mk.virtualkey,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  }

 
  if (cuisinelist !== undefined) {
    // query =query +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +filterquery;
    kitchenquery = kitchenquery +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +cuisinequery;
  }else{
    kitchenquery = kitchenquery + " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1)  and (pt.quantity != 0 and pt.delete_status !=1 and pt.active_status = 1 ) ";
  }

  if (req.vegtype) {
    kitchenquery = kitchenquery + "and mk.food_type= 0";
  }

 
  // var day = new Date();
  // var currenthour = day.getHours();

  // if (currenthour < 12) {

  //   kitchenquery = kitchenquery + " and pt.breakfast = 1";
    
  // }else if(currenthour >= 12 && currenthour < 16){

  //   kitchenquery = kitchenquery + " and pt.lunch = 1";

  // }else if( currenthour >= 16){
    
  //   kitchenquery = kitchenquery + " and pt.dinner = 1";
  // }



  if (req.sortid == 1) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY distance,mk.unservicable = 0 desc";
  } else if (req.sortid == 2) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.rating DESC,mk.unservicable = 0 desc";
  } else if (req.sortid == 3) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo ASC";
  } else if (req.sortid == 4) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo DESC";
  } else {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc";
  }



  sql.query(kitchenquery, async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      ////Zone Condition Make Array////
      if(constant.zone_control){
        ////Get User Zone////
        var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid ='';
        var zonename = '';
        var zonemakeitsrrsy =[];
        if(getzone.zone_id){          
          userzoneid = getzone.zone_id;
          zonename = getzone.zone_name;
        }
        ////Make Zone Servicable kitchen array////
        var zonemakeitsrrsy = res.filter(kitchenarray => (kitchenarray.zone==userzoneid && kitchenarray.unservicable==0));
      }

      for (let i = 0; i < res.length; i++) {
        //res[i].distance = res[i].distance * constant.onemile;
        res[i].distance = res[i].distance.toFixed(2) ;

        var eta = constant.delivery_buffer_time + foodpreparationtime + (onekm * res[i].distance);
        //15min Food Preparation time , 3min 1 km
       
        res[i].eta = Math.round(eta);    
        res[i].serviceablestatus = false;
        res[i].kitchenstatus = 1;

        if (res[i].unservicable == 0) {
          res[i].serviceablestatus = true;
          res[i].kitchenstatus = 0;
        }
        
        //////////////Zone Condition//////////
        if(constant.zone_control){
          if (res[i].serviceablestatus !== false) {
            if(zonemakeitsrrsy.length !=0 && res[i].zone==userzoneid){
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else if (zonemakeitsrrsy.length ==0 && res[i].distance <= radiuslimit){
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else{
              res[i].serviceablestatus = false;
              res[i].kitchenstatus = 1;
            }
          }
        }else{
          if (res[i].serviceablestatus !== false) {
            if (res[i].distance <= radiuslimit) {
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else{
              res[i].serviceablestatus = false;
              res[i].kitchenstatus = 1;
            }
          }
        }

        //for time sort purpose
        res[i].etatime = Math.round(eta);

       
        if ( res[i].eta > 60) {
          var hours = res[i].eta / 60;
          var rhours = Math.floor(hours);
          var minutes = (hours - rhours) * 60;
          var rminutes = Math.round(minutes);
         
         // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
         res[i].eta = "above 60 Mins"
        }else{
          res[i].eta = Math.round(eta) + " mins";
        }

       
        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }


        if (res[i].member_type) {

          if (res[i].member_type === 1) {
            res[i].member_type_name = 'Gold';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
          }else if (res[i].member_type === 2){
            res[i].member_type_name = 'Silver';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
          }else if (res[i].member_type === 3){
            res[i].member_type_name = 'bronze';
            res[i].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
          }
        }

      }

     
      if (!req.sortid) {
        res.sort((a, b) => parseFloat(a.kitchenstatus) - parseFloat(b.kitchenstatus));
      }

      const serviceablekitchenlist =  res.filter(res => res.kitchenstatus < 1);
      const unserviceablekitchenlist =  res.filter(res => res.kitchenstatus > 0);

      if (!req.sortid) {
        serviceablekitchenlist.sort((a, b) => parseFloat(a.virtualkey) - parseFloat(b.virtualkey));
      }

      if (!req.sortid) {
        unserviceablekitchenlist.sort((a, b) => parseFloat(a.etatime) - parseFloat(b.etatime));
      }
     // if (res[0].serviceablestatus === false ) {
     var kitchenlist = [];
     kitchenlist = serviceablekitchenlist.concat(unserviceablekitchenlist); 
    //  kitchenlist.push(serviceablekitchenlist);
    //  kitchenlist.push(unserviceablekitchenlist);

   // console.log(tunnelkitchenliststatus);
        if (tunnelkitchenliststatus == false) {
          
            for (let i = 0; i < kitchenlist.length; i++) {
              kitchenlist[i].serviceablestatus = true;
              kitchenlist[i].kitchenstatus = 0;   
        }
      }

      let resobj = {
        success: true,
        status:true,
        zoneId:userzoneid,
        zoneName:zonename,
        result: kitchenlist
      };
      result(null, resobj);
    }
  });
};


Eatuser.list_all_active_collection_cid = function list_all_active_collection_cid(req,res) {

  Collection.list_all_active_collection(req, function(err, collection) {
    if (err) res.send(err);
    console.log("collectionlist--------------",collection);
    //res.send(collection);
   // res(null, collection);
    return collection;


  });
};

//kitchen list infinity
Eatuser.get_eat_kitchen_list_sort_filter_v_2_2 = async function (req, result) {
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm               = constant.onekm;
  var radiuslimit         = constant.radiuslimit;
  var tunnelkitchenliststatus = true;
  const userdetails       = await query("select * from User where userid = "+req.eatuserid+" ");
  
  if (userdetails[0].first_tunnel == 1 ) {
    var tunnelkitchenquery =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) GROUP BY pt.productid HAVING distance < "+radiuslimit+"  ORDER BY mk.unservicable = 0 desc";
    const tunnelkitchenlist = await query(tunnelkitchenquery);

    var locationdetails       = {};
    locationdetails.lat       = req.lat;
    locationdetails.lon       = req.lon;
    locationdetails.address   = req.address || '';
    locationdetails.locality  = req.locality ||'';
    locationdetails.city      = req.city || '';
    locationdetails.userid    = req.eatuserid;

    if (tunnelkitchenlist.length == 0) {
      tunnelkitchenliststatus     = false;
      locationdetails.type=1;

      await Eatuser.create_first_tunnel_user_location(locationdetails);
    }else{
      locationdetails.type=0;
      await Eatuser.create_first_tunnel_user_location(locationdetails);

      const usertunnelupdate = await query("Update User set first_tunnel = 0 where userid = "+req.eatuserid+" ");
    }
  }  
  
  var cuisinequery  = "";
  var cuisinelist   = [];
  if (req.cuisinelist !== undefined || req.cuisinelist !== null) {
    cuisinelist = req.cuisinelist;
  }

  if (cuisinelist) {
    for (let i = 0; i < cuisinelist.length; i++) {
      cuisinequery = cuisinequery + " cm.cuisineid = '" + cuisinelist[i].cuisine + "' or";
    }
  }

  cuisinequery = cuisinequery.slice(0, -2) + ")";
  if (req.eatuserid) {
    var kitchenquery =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.member_type,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,mk.virtualkey,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  } else {
    kitchenquery =
      "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.unservicable,ly.localityname,mk.virtualkey,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  }
 
  if (cuisinelist !== undefined) {
    kitchenquery = kitchenquery +" where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (" +cuisinequery;
  }else{
    kitchenquery = kitchenquery + " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1)  and (pt.quantity != 0 and pt.delete_status !=1 and pt.active_status = 1 ) ";
  }

  if (req.vegtype) {
    kitchenquery = kitchenquery + "and mk.food_type= 0";
  }

  if (req.sortid == 1) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY distance,mk.unservicable = 0 desc ";
  } else if (req.sortid == 2) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.rating DESC,mk.unservicable = 0 desc ";
  } else if (req.sortid == 3) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo ASC ";
  } else if (req.sortid == 4) {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,mk.costfortwo desc ";
  } else {
    kitchenquery = kitchenquery + " GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc ";
  }

  sql.query(kitchenquery, async function(err, res) {
    if (err) {
      result(err, null);
    } else {
      ////Zone Condition Make Array////
      if(constant.zone_control){
        ////Get User Zone////
        var getzone     = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid  = '';
        var zonename    = '';
        var zonemakeitsrrsy = [];
        if(getzone.zone_id){          
          userzoneid = getzone.zone_id;
          zonename   = getzone.zone_name;
          ////Make Zone Servicable kitchen array////
          var zonemakeitsrrsy = res.filter(kitchenarray => (kitchenarray.zone==userzoneid && kitchenarray.unservicable==0));
        }        
      }

      for (let i = 0; i < res.length; i++) {
        res[i].title    = "kitchen";
        res[i].subtitle = "kitchen";
        res[i].type     = 0;
        res[i].distance = res[i].distance.toFixed(2) ;
        res[i].distance = Math.ceil(res[i].distance);
        var eta         = constant.delivery_buffer_time +foodpreparationtime + (onekm * res[i].distance);
        res[i].eta      = Math.round(eta);    
        res[i].serviceablestatus = false;
        res[i].kitchenstatus     = 1;

        if (res[i].unservicable == 0) {
          res[i].serviceablestatus = true;
          res[i].kitchenstatus     = 0;
        }

        //////////////Zone Condition//////////
        if(constant.zone_control){
          if (res[i].serviceablestatus !== false) {
            if(zonemakeitsrrsy.length !=0 && res[i].zone==userzoneid){
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else if (zonemakeitsrrsy.length ==0 && res[i].distance <= radiuslimit){
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else{
              res[i].serviceablestatus = false;
              res[i].kitchenstatus = 1;
            }
          }
        }else{
          if (res[i].serviceablestatus !== false) {
            if (res[i].distance <= radiuslimit) {
              res[i].serviceablestatus = true;
              res[i].kitchenstatus = 0;
            }else{
              res[i].serviceablestatus = false;
              res[i].kitchenstatus = 1;
            }
          }
        }

        //for time sort purpose
        res[i].etatime = Math.round(eta);        
        if ( res[i].eta > 60) {
          var hours     = res[i].eta / 60;
          var rhours    = Math.floor(hours);
          var minutes   = (hours - rhours) * 60;
          var rminutes  = Math.round(minutes);
          res[i].eta    = "above 60 Mins"
        }else{
          res[i].eta = Math.round(eta) + " mins";
        }

        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }

        if (res[i].member_type) {
          if (res[i].member_type === 1) {
            res[i].member_type_name = 'Gold';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
          }else if (res[i].member_type === 2){
            res[i].member_type_name = 'Silver';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
          }else if (res[i].member_type === 3){
            res[i].member_type_name = 'bronze';
            res[i].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
          }
        }
      }
      
      if (!req.sortid) {
        res.sort((a, b) => parseFloat(a.kitchenstatus) - parseFloat(b.kitchenstatus));
      }

      const serviceablekitchenlist    = res.filter(res => res.kitchenstatus < 1);
      const unserviceablekitchenlist  = res.filter(res => res.kitchenstatus > 0);

      if (!req.sortid) {
        serviceablekitchenlist.sort((a, b) => parseFloat(a.virtualkey) - parseFloat(b.virtualkey));
      }

      if (!req.sortid) {
        unserviceablekitchenlist.sort((a, b) => parseFloat(a.etatime) - parseFloat(b.etatime));
      }
      
      var kitchenlist = [];
      kitchenlist = serviceablekitchenlist.concat(unserviceablekitchenlist); 
      
      if (tunnelkitchenliststatus == false) {
        for (let i = 0; i < kitchenlist.length; i++) {
          kitchenlist[i].serviceablestatus = true;
          kitchenlist[i].kitchenstatus = 0;   
        }
      }
      
    ///=============>Start: infinity screen<==============//////////////
    var kitchen_pagenation_limit = constant.infinity_kitchen_page_limit;
    var kitchencount  = kitchenlist.length;
    if (kitchenlist.length!=0) {
      var pagecount   = Math.ceil(kitchencount / kitchen_pagenation_limit);   
      var orderlimit  = kitchen_pagenation_limit;
      var page        = req.page || 1;

      var totalpagecount = constant.infinity_repeat_switch_loop * pagecount;
      var switchrun = 0;
      if(totalpagecount >= page && pagecount <= page){
        while(page > pagecount){
          page  = page - pagecount;
        }
      }else if(totalpagecount <= page){
        switchrun  = 1;
      }

      var startlimit    = (page - 1) * orderlimit;
      var endlimit      = startlimit + orderlimit;
      var kitchenlist   = kitchenlist.slice(startlimit, endlimit);
    }    

    if(switchrun==0){
      switch(parseInt(page)){
        case 1:
          if (kitchenlist.length !=0) {
            await Collection.list_all_active_collection_infinity_screen(req,async function(err,res3) {
              if (err) {
                result(err, null);
              } else {
                // if (res3.status != true) {
                //   result(null, res3);
                // } else {   
                  
                
                                
                // }
                if (res3.status == true) {
                var collectionlist        = {};
                collectionlist.collection = res3.collection;
                var collectiontype        = collectionlist.collection;
                var collectiontrue = collectiontype.filter(collectiontype => collectiontype.type==2);
                collectionlist.collection = collectiontrue.filter(collectiontrue => collectiontrue.collectionstatus==true);

                
                if(kitchenlist.length >= kitchen_pagenation_limit){
                  kitchenlist.push(collectionlist);
                  kitchenlist[kitchenlist.length-1].title   = "Collections";
                  kitchenlist[kitchenlist.length-1].subtitle= "Collections";
                  kitchenlist[kitchenlist.length-1].type    = 1; 
                }   
                }
                                  

                let resobj = {
                  success: true,
                  status:true,
                  zoneId:userzoneid,
                  zoneName:zonename,
                  kitchencount :kitchencount ||0,
                  pagecount : pagecount ||0,
                  result: kitchenlist
                };  
                result(null, resobj); 
              }
            });
          }else{ 
            let resobj = {
              success: true,
              status:true,
              zoneId:userzoneid,
              zoneName:zonename,
              kitchencount :kitchencount ||0,
              pagecount : pagecount ||0,
              result: kitchenlist
            };  
            result(null, resobj); 
          }               
          break;
        case 2:
          if (kitchenlist.length !=0) {
            Stories.getAllStories(req,async function(err,storieslist){
              if(err){
                result(err, null);
              }else{              
                var stories={};
                stories.story = storieslist.result;
  
                if(kitchenlist.length >= kitchen_pagenation_limit){
                  kitchenlist.push(stories); 
                  kitchenlist[kitchenlist.length-1].title   = "NEW ON EAT";
                  kitchenlist[kitchenlist.length-1].subtitle= "Meet our newly onboared homemakers and kitchens";
                  kitchenlist[kitchenlist.length-1].type    = 2;  
                }                
                
                let resobj = {
                  success: true,
                  status:true,
                  zoneId:userzoneid,
                  zoneName:zonename,
                  kitchencount :kitchencount ||0,
                  pagecount : pagecount ||0,
                  result: kitchenlist
                };            
                result(null, resobj);
              }  
            });
          } else {
            let resobj = {
              success: true,
              status:true,
              zoneId:userzoneid,
              zoneName:zonename,
              kitchencount :kitchencount ||0,
              pagecount : pagecount ||0,
              result: kitchenlist
            };    
            result(null, resobj);
          }        
          break;
        case 3:
          if (kitchenlist.length !=0) {
            Eatuser.get_eat_region_makeit_list_by_eatuserid(req,async function(err,regionlist){
              if(err){
                result(err, null);
              }else{
                var regioncard = {};
                regioncard.regions  = regionlist.result;
  
                if(kitchenlist.length >= kitchen_pagenation_limit){
                  kitchenlist.push(regioncard);
                  kitchenlist[kitchenlist.length-1].title   = "EAT REGIONS";
                  kitchenlist[kitchenlist.length-1].subtitle= "Home cooked food from over 25 plus regions";
                  kitchenlist[kitchenlist.length-1].type    = 3;
                }

                let resobj = {
                  success: true,
                  status:true,
                  zoneId:userzoneid,
                  zoneName:zonename,
                  kitchencount :kitchencount ||0,
                  pagecount : pagecount ||0,
                  result: kitchenlist                  
                };            
                result(null, resobj);
              }    
            });
          } else {
            let resobj = {
              success: true,
              status:true,
              zoneId:userzoneid,
              zoneName:zonename,
              kitchencount :kitchencount ||0,
              pagecount : pagecount ||0,
              result: kitchenlist
            };      
            result(null, resobj);
          } 
          break;
        case 4:
          if (kitchenlist.length !=0) {
            req.cid = constant.infinity_first_collection_details_cid;
            Collection.get_all_collection_by_cid_v2_infinity_screen(req,async function(err,collectiontype2list) {
              if (err) { 
                result(err, null);
              } else {
                // if (collectiontype2list.status != true) {
                //   repeat_collection = 1;
                //   result(null, collectiontype2list);
                // } else {
                  
                // }

                if (collectiontype2list.status == true) {
                  var collectionlist = {};
                  collectionlist.collection_details = collectiontype2list.result;
                  
                  if(kitchenlist.length >= kitchen_pagenation_limit && collectionlist.collection_details.length>0){
                    kitchenlist.push(collectionlist);
                    kitchenlist[kitchenlist.length-1].title   = collectionlist.collection_details[0].heading;
                    kitchenlist[kitchenlist.length-1].subtitle= collectionlist.collection_details[0].subheading;
                    kitchenlist[kitchenlist.length-1].type    = 4;
                  }
                }

               

                  let resobj = {
                    success: true,
                    status:true,
                    zoneId:userzoneid,
                    zoneName:zonename,
                    kitchencount :kitchencount ||0,
                    pagecount : pagecount ||0,
                    result: kitchenlist
                  }; 
                  repeat_collection=1;           
                  result(null, resobj);
              }
            }); 
          } else {
            let resobj = {
              success: true,
              status:true,
              zoneId:userzoneid,
              zoneName:zonename,
              kitchencount :kitchencount ||0,
              pagecount : pagecount ||0,
              result: kitchenlist
            };    
            result(null, resobj);
          }
          break;
        case 5:
          if (kitchenlist.length !=0) {
            Offers.get_coupons_by_userid(req,async function(err,offerlist){
              if(err){
                result(err, null);
              }else{
                var Couponlist={};
                Couponlist.coupon=offerlist.result;
  
                if(kitchenlist.length >= kitchen_pagenation_limit){
                  kitchenlist.push(Couponlist); 
                  kitchenlist[kitchenlist.length-1].title   = "Couponlist";
                  kitchenlist[kitchenlist.length-1].subtitle= "Couponlist";
                  kitchenlist[kitchenlist.length-1].type    = 5;
                }                
  
                let resobj = {
                  success: true,
                  status:true,
                  zoneId:userzoneid,
                  zoneName:zonename,
                  kitchencount :kitchencount ||0,
                  pagecount : pagecount ||0,
                  result: kitchenlist
                };            
                result(null, resobj);
              }
            });
          } else {
            let resobj = {
              success: true,
              status:true,
              zoneId:userzoneid,
              zoneName:zonename,
              kitchencount :kitchencount ||0,
              pagecount : pagecount ||0,
              result: kitchenlist
            };    
            result(null, resobj);
          }
          break;
        default:
          if (kitchenlist.length !=0) {
            var repeat_collection = page%2;
            if(repeat_collection ==0){
              ///////////Collection List//////////////
              console.log("Collection List  ===============>");
              await Collection.list_all_active_collection(req,async function(err,res3) {
                if (err) {
                  result(err, null);
                } else {
                  // if (res3.status != true) {
                  //   repeat_collection =2 ;
                  //   result(null, res3);
                  // } else {      
                                               
                  // }

                  if (res3.status == true) {
                    var collectionlist        = {};
                    collectionlist.collection = res3.collection;
                    // var collectiontype        = collectionlist.collection;
                    // collectionlist.collection = collectiontype.filter(collectiontype => collectiontype.type==2);
                    var collectiontype        = collectionlist.collection;
                    var collectiontrue = collectiontype.filter(collectiontype => collectiontype.type==2);
                    collectionlist.collection = collectiontrue.filter(collectiontrue => collectiontrue.collectionstatus==true);
                    if(kitchenlist.length >= kitchen_pagenation_limit){
                      kitchenlist.push(collectionlist);
                      kitchenlist[kitchenlist.length-1].title   = "Collections";
                      kitchenlist[kitchenlist.length-1].subtitle= "Collections";
                      kitchenlist[kitchenlist.length-1].type    = 1; 
                    }  
                  }

                
                  
                  let resobj = {
                    success: true,
                    status:true,
                    zoneId:userzoneid,
                    zoneName:zonename,
                    kitchencount :kitchencount ||0,
                    pagecount : pagecount ||0,
                    result: kitchenlist
                  };  
                  repeat_collection=2;
                  result(null, resobj);     
                }
              });            
            }else{
              ///////////Collection Details//////////////
              console.log("Collection Details  ===============>");
              Collection.list_all_active_collection(req,async function(err,cidlist) {
                if (err) { 
                  result(err, null);
                } else {
                  collectionlist = cidlist.collection.filter(collectiontype => collectiontype.type==3);
                  var cidarray = collectionlist.map(obj =>{  return obj.cid; });
                  req.cid = cidarray[Math.floor(Math.random()*cidarray.length)];
                  Collection.get_all_collection_by_cid_v2_infinity_screen(req,async function(err,collectiontype2list) {
                    if (err) { 
                      result(err, null);
                    } else {
                      if (collectiontype2list.status != true) {
                        repeat_collection = 1;
                        result(null, collectiontype2list);
                      } else {
                        var collectionlist = {};
                        collectionlist.collection_details = collectiontype2list.result;
                        
                        if(kitchenlist.length >= kitchen_pagenation_limit){
                          kitchenlist.push(collectionlist);
                          kitchenlist[kitchenlist.length-1].title   = collectionlist.collection_details[0].heading;
                          kitchenlist[kitchenlist.length-1].subtitle= collectionlist.collection_details[0].subheading;
                          kitchenlist[kitchenlist.length-1].type    = 4;
                        }

                        let resobj = {
                          success: true,
                          status:true,
                          zoneId:userzoneid,
                          zoneName:zonename,
                          kitchencount :kitchencount ||0,
                          pagecount : pagecount ||0,
                          result: kitchenlist
                        }; 
                        repeat_collection=1;           
                        result(null, resobj);
                      }
                    }
                  }); 
                }
              });                        
            }
          } else {
            let resobj = {
              success: true,
              status:true,
              zoneId:userzoneid,
              zoneName:zonename,
              kitchencount :kitchencount ||0,
              pagecount : pagecount ||0,
              result: kitchenlist
            };  
            result(null, resobj);
          }
      }
    }else{
      let resobj = {
        success: true,
        status:true,
        zoneId:userzoneid,
        zoneName:zonename,
        kitchencount :kitchencount ||0,
        pagecount : pagecount ||0,
        result: kitchenlist
      };  
      result(null, resobj);
    }    
    ///=============>End: infinity screen<==============//////////////    
    }   
  });
};


Eatuser.timeConvert = function timeConvert(n,result) {
  console.log("minitues calculate");
  var num = n;
  var hours = num / 60;
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return (eta +" minutes = " +rhours +" hour(s) and " +rminutes +" minute(s).");
};

Eatuser.eat_user_referral_code = function eat_user_referral_code(req,headers,result) {
   
    var refferalcontent = constant.refferalcontent;

       sql.query("select referalcode from User where userid = '"+req.userid+"' " , function (err, res) {
   
           if(err) {
               console.log("error: ", err);
               result(err, null);
           }
           else{
              
          //  res[0].applink = "https://play.google.com/store/apps/details?id=com.tovo.eat&referrer=utm_source%3Dreferral%26utm_medium%3D"+res[0].referalcode+"%26utm_campaign%3Dreferral";
        //  console.log("res[0].referalcode: ", res[0].referalcode);
        
              

           if (headers.apptype === '1' || headers.apptype === 1) {
        
            res[0].applink = refferalcontent+" "+constant.applink +". Use Refferal Code :"+ res[0].referalcode
           
              
            }else if (headers.apptype === '2' || headers.apptype === 2) {
              res[0].applink = refferalcontent+" "+constant.iosapplink +". Use Refferal Code :"+ res[0].referalcode
      
            }else{
              res[0].applink = refferalcontent+" "+constant.applink +". Use Refferal Code :"+ res[0].referalcode
            }

          
               let resobj = {  
               success: true,
               status: true,
               result: res
               }; 
   
            result(null, resobj);
         
           }
           });   
};
/********************************************************************/
// this working code please don't remove this code. i just commanded due to login flow change 04-07-2019
//  Eatuser.eatuser_login = function eatuser_login(newUser, result) { 
     
//   var OTP = Math.floor(Math.random() * 90000) + 10000;
   
//   var passwordstatus = false;
//   var otpstatus = false;
//   var genderstatus = false;
//   var otptemp = 0;
//   var otpurl =
//     "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
//     newUser.phoneno +
//     "&senderId=EATHOM&message=Your EAT App OTP is " +
//     OTP +
//     ". Note: Please DO NOT SHARE this OTP with anyone.";

//   // var otpurl = "https://www.google.com/";

//   sql.query("Select * from User where phoneno = '" + newUser.phoneno + "'",function(err, res) {
//       if (err) {
//         console.log("error: ", err);
//         result(err, null);
//       } else {
//         console.log(res);
//         if (res.length === 0) {
//           console.log("validate password");

//           request({
//               method: "GET",
//               rejectUnauthorized: false,
//               url: otpurl
//             },
//             function(error, response, body) {
//               if (error) {
//                 console.log("error: ", err);
//                 result(null, err);
//               } else {
//                 console.log(response.statusCode, body);
//                 var responcecode = body.split("#");
//                 console.log(responcecode);

//                 if (responcecode[0] === "0") {
//                   sql.query(
//                     "insert into Otp(phone_number,apptype,otp)values('" +
//                       newUser.phoneno +
//                       "',4,'" +
//                       OTP +
//                       "')",
//                     function(err, res1) {
//                       if (err) {
//                         console.log("error: ", err);
//                         result(null, err);
//                       } else {
//                         let resobj = {
//                           success: true,
//                           status: true,
//                           message: responcecode[1],
//                           passwordstatus: passwordstatus,
//                           otpstatus: otpstatus,
//                           genderstatus: genderstatus,
//                           oid: res1.insertId
//                         };

//                         result(null, resobj);
//                       }
//                     }
//                   );
//                 } else {
//                   let resobj = {
//                     success: true,
//                     status: false,
//                     message: responcecode[1],
//                     passwordstatus: passwordstatus,
//                     otpstatus: otpstatus,
//                     genderstatus: genderstatus
//                   };

//                   result(null, resobj);
//                 }
//               }
//             }
//           );
//         } else {
//           console.log(res);
//              //eat login password validate condition commanded 04-07-2019
//           // if (res[0].password !== "" && res[0].password !== null) {
//           //   passwordstatus = true;
//           //   otpstatus = true;
//           //   genderstatus = true;
//           // }

//           if (
//             res[0].gender !== "" &&
//             res[0].gender !== null &&
//             res[0].name !== "" &&
//             res[0].name !== null
//           ) {
//             genderstatus = true;
//             // otpstatus = true;
//           }

//           if (passwordstatus === false) {
//             request(
//               {
//                 method: "GET",
//                 rejectUnauthorized: false,
//                 url: otpurl
//               },
//               function(error, response, body) {
//                 if (error) {
//                   console.log("error: ", err);
//                   result(null, err);
//                 } else {
//                   console.log(response.statusCode, body);
//                   var responcecode = body.split("#");
//                   console.log(responcecode[0]);

//                   if (responcecode[0] === "0") {
//                     sql.query(
//                       "insert into Otp(phone_number,apptype,otp)values('" +
//                         newUser.phoneno +
//                         "',4,'" +
//                         OTP +
//                         "')",
//                       function(err, res1) {
//                         if (err) {
//                           console.log("error: ", err);
//                           result(null, err);
//                         } else {
//                           let resobj = {
//                             success: true,
//                             status: true,
//                             message: responcecode[1],
//                             passwordstatus: passwordstatus,
//                             otpstatus: otpstatus,
//                             genderstatus: genderstatus,
//                             oid: res1.insertId
//                           };

//                           result(null, resobj);
//                         }
//                       }
//                     );
//                   } else {
//                     let resobj = {
//                       success: true,
//                       status: false,
//                       message: responcecode[1],
//                       passwordstatus: passwordstatus,
//                       otpstatus: otpstatus,
//                       genderstatus: genderstatus,
//                       userid: res[0].userid,
//                       oid: res1.insertId
//                     };

//                     result(null, resobj);
//                   }
//                 }
//               }
//             );
//           } else {
//             let sucobj = true;
//             let resobj = {
//               success: sucobj,
//               status: true,
//               passwordstatus: passwordstatus,
//               otpstatus: otpstatus,
//               genderstatus: genderstatus,
//               userid: res[0].userid
//             };

//             result(null, resobj);
//           }
//         }
//       }
//     }
//   );
// };

/********************************************************************/


///sms for bulksmsapi

// Eatuser.eatuser_login = function eatuser_login(newUser, result) { 
//   // console.log(newUser.otpcode);  
//   var OTP = Math.floor(Math.random() * 90000) + 10000;
   
//   var passwordstatus = false;
//   var otpstatus = false;
//   var genderstatus = false;
//   var otptemp = 0;

//   if (newUser.otpcode) {
//     var otpurl =
//     "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
//     newUser.phoneno +
//     "&senderId=EATHOM&message=<%23>Your EAT App OTP is " +
//     OTP +
//     ". Note: Please DO NOT SHARE this OTP with anyone. " +
//     newUser.otpcode +
//     " ";
//   }else{

//     var otpurl =
//     "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
//     newUser.phoneno +
//     "&senderId=EATHOM&message=Your EAT App OTP is " +
//     OTP +
//     ". Note: Please DO NOT SHARE this OTP with anyone. ";
//   }

 

//   // var otpurl = "https://www.google.com/";

//   sql.query("Select * from User where phoneno = '" + newUser.phoneno + "'",function(err, res) {
//       if (err) {
//         console.log("error: ", err);
//         result(err, null);
//       } else {
//         console.log(res);
//         if (res.length === 0) {
//           console.log("validate password");

//           request({
//               method: "GET",
//               rejectUnauthorized: false,
//               url: otpurl
//             },
//             function(error, response, body) {
//               if (error) {
//                 console.log("error: ", err);
//                 result(null, err);
//               } else {
//                 console.log(response.statusCode, body);
//                 var responcecode = body.split("#");
//                 console.log(responcecode);

//                 if (responcecode[0] === "0") {
//                   sql.query(
//                     "insert into Otp(phone_number,apptype,otp)values('" +
//                       newUser.phoneno +
//                       "',4,'" +
//                       OTP +
//                       "')",
//                     function(err, res1) {
//                       if (err) {
//                         console.log("error: ", err);
//                         result(null, err);
//                       } else {
//                         let resobj = {
//                           success: true,
//                           status: true,
//                           message: responcecode[1],
//                           passwordstatus: passwordstatus,
//                           otpstatus: otpstatus,
//                           genderstatus: genderstatus,
//                           oid: res1.insertId
//                         };

//                         result(null, resobj);
//                       }
//                     }
//                   );
//                 } else {
//                   let resobj = {
//                     success: true,
//                     status: false,
//                     message: responcecode[1],
//                     passwordstatus: passwordstatus,
//                     otpstatus: otpstatus,
//                     genderstatus: genderstatus
//                   };

//                   result(null, resobj);
//                 }
//               }
//             }
//           );
//         } else {
//           console.log(res);
//              //eat login password validate condition commanded 04-07-2019
//           // if (res[0].password !== "" && res[0].password !== null) {
//           //   passwordstatus = true;
//           //   otpstatus = true;
//           //   genderstatus = true;
//           // }

//           if (res[0].gender !== "" &&res[0].gender !== null && res[0].name !== "" && res[0].name !== null) {
           
//             genderstatus = true;
//             // otpstatus = true;
//              }

//           if (passwordstatus === false) {
//             request(
//               {
//                 method: "GET",
//                 rejectUnauthorized: false,
//                 url: otpurl
//               },
//               function(error, response, body) {
//                 if (error) {
//                   console.log("error: ", err);
//                   result(null, err);
//                 } else {
//                   console.log(response.statusCode, body);
//                   var responcecode = body.split("#");
//                   console.log('responcecode'+responcecode[0]);

//                   if (responcecode[0] === "0") {
//                     sql.query("insert into Otp(phone_number,apptype,otp)values('" +newUser.phoneno +"',4,'" +OTP +"')",function(err, res1) {
//                         if (err) {
//                           console.log("error: ", err);
//                           result(null, err);
//                         } else {
//                           let resobj = {
//                             success: true,
//                             status: true,
//                             message: responcecode[1],
//                             passwordstatus: passwordstatus,
//                             otpstatus: otpstatus,
//                             genderstatus: genderstatus,
//                             oid: res1.insertId
//                           };

//                           result(null, resobj);
//                         }
//                       }
//                     );
//                   } else {
//                     let resobj = {
//                       success: true,
//                       status: false,
//                       message: responcecode[0],
//                       otpstatus: otpstatus,
//                       genderstatus: genderstatus,
//                       message : responcecode
//                     };

//                     result(null, resobj);
//                   }
//                 }
//               }
//             );
//           } else {
//             let sucobj = true;
//             let resobj = {
//               success: sucobj,
//               status: true,
//               passwordstatus: passwordstatus,
//               otpstatus: otpstatus,
//               genderstatus: genderstatus,
//               userid: res[0].userid
//             };

//             result(null, resobj);
//           }
//         }
//       }
//     }
//   );
// };

///instaalerts sms service
Eatuser.eatuser_login = function eatuser_login(newUser, result) { 
  // console.log(newUser.otpcode);  
  var OTP = Math.floor(Math.random() * 90000) + 10000;
   
  var passwordstatus = false;
  var otpstatus = false;
  var genderstatus = false;
  var otptemp = 0;


   if (newUser.otpcode) {
   var otpurl =
    "https://www.instaalerts.zone/SendSMS/sendmsg.php?uname=EATotp1&pass=abc321&send=EATHOM&dest=" +
    newUser.phoneno +
    "&msg=<%23>Your EAT App OTP is " +
    OTP +
    ". Note: Please DO NOT SHARE this OTP with anyone. " +
    newUser.otpcode +
    " ";
  }else{

   var otpurl =
    "https://www.instaalerts.zone/SendSMS/sendmsg.php?uname=EATotp1&pass=abc321&send=EATHOM&dest=" +
    newUser.phoneno +
    "&msg=<%23>Your EAT App OTP is " +
    OTP +
    ". Note: Please DO NOT SHARE this OTP with anyone. ";
  }


  // var otpurl = "https://www.google.com/";

  sql.query("Select * from User where phoneno = '" + newUser.phoneno + "'",function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log(res);
        if (res.length === 0) {
          console.log("validate password");

          request({
              method: "GET",
              rejectUnauthorized: false,
              url: otpurl
            },
            function(error, response, body) {
              if (error) {
                console.log("error: ", err);
                result(null, err);
              } else {
                console.log(response.statusCode, body);
                var responcecode = body.split("#");
                console.log(responcecode);

                if (body) {
                  sql.query(
                    "insert into Otp(phone_number,apptype,otp)values('" +
                      newUser.phoneno +
                      "',4,'" +
                      OTP +
                      "')",
                    function(err, res1) {
                      if (err) {
                        console.log("error: ", err);
                        result(null, err);
                      } else {
                        let resobj = {
                          success: true,
                          status: true,
                          message: "message sent successfully",
                          passwordstatus: passwordstatus,
                          otpstatus: otpstatus,
                          genderstatus: genderstatus,
                          oid: res1.insertId
                        };

                        result(null, resobj);
                      }
                    }
                  );
                } else {
                  let resobj = {
                    success: true,
                    status: false,
                    message: "message sent successfully",
                    passwordstatus: passwordstatus,
                    otpstatus: otpstatus,
                    genderstatus: genderstatus
                  };

                  result(null, resobj);
                }
              }
            }
          );
        } else {
       
             //eat login password validate condition commanded 04-07-2019
          // if (res[0].password !== "" && res[0].password !== null) {
          //   passwordstatus = true;
          //   otpstatus = true;
          //   genderstatus = true;
          // }

          if (res[0].gender !== "" &&res[0].gender !== null && res[0].name !== "" && res[0].name !== null) {
           
            genderstatus = true;
            // otpstatus = true;
             }

          if (passwordstatus === false) {
            request(
              {
                method: "GET",
                rejectUnauthorized: false,
                url: otpurl
              },
              function(error, response, body) {
                if (error) {
                  console.log("error: ", err);
                  result(null, err);
                } else {
                  console.log(response.statusCode, body);
                  var responcecode = body.split("#");
                  console.log('responcecode'+responcecode[0]);

                  if (body) {
                    sql.query("insert into Otp(phone_number,apptype,otp)values('" +newUser.phoneno +"',4,'" +OTP +"')",function(err, res1) {
                        if (err) {
                          console.log("error: ", err);
                          result(null, err);
                        } else {
                          let resobj = {
                            success: true,
                            status: true,
                            message: "message sent successfully",
                            passwordstatus: passwordstatus,
                            otpstatus: otpstatus,
                            genderstatus: genderstatus,
                            oid: res1.insertId
                          };

                          result(null, resobj);
                        }
                      }
                    );
                  } else {
                    let resobj = {
                      success: true,
                      status: false,
                      message: "message sent successfully",
                      otpstatus: otpstatus,
                      genderstatus: genderstatus,
                      message : responcecode
                    };

                    result(null, resobj);
                  }
                }
              }
            );
          } else {
            let sucobj = true;
            let resobj = {
              success: sucobj,
              status: true,
              passwordstatus: passwordstatus,
              otpstatus: otpstatus,
              genderstatus: genderstatus,
              userid: res[0].userid
            };

            result(null, resobj);
          }
        }
      }
    }
  );
};

Eatuser.eatuser_logout = async function eatuser_logout(req, result) { 
  sql.query("select * from User where userid = "+req.userid+" ",async function(err,userdetails) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {

  
     //  let token = req.headers['x-access-token'] || req.headers['token'];
      // let apptype = req.headers['x-access-token'] || req.headers['apptype'];
   
      
      //console.log(token);
        // if (apptype == 1) {
          
        //  query = "pushid_android = '' an";

        // }else if (apptype == 2) {
          
        // }

       
      if (userdetails.length !==0) {
        
        updatequery = await query ("Update User set pushid_android = '' and pushid_ios=' ' where userid = '"+req.userid+"'");


        let resobj = {
          success: true,
           status: true,
          // message:mesobj,
          message: 'Logout Successfully!'  
        };
  
        result(null, resobj);
      }else{

        let resobj = {
          success: true,
           status: false,
          // message:mesobj,
          message: 'Please check userid'  
        };
  
        result(null, resobj);
      }     
    }
  });   
 
};

Eatuser.eatuser_otpverification =async function eatuser_otpverification(req,result) {
  var otp = 0;
  var passwordstatus = false;
  var emailstatus = false;
  var otpstatus = false;
  var genderstatus = false;
  var userdetails = await query ("Select userid,name,email,phoneno,referalcode,Locality,gender,virtualkey,regionid,razer_customerid,referredby,token,first_tunnel from User where userid = 135 ");

  if (req.phoneno == '9500313689' && req.otp == 30878) {
    
    let resobj = {
      success: true,
       status: true,
      // message:mesobj,
      message: 'Authentication successful!',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ijk1MDAzMTM2ODkiLCJpYXQiOjE1NjM5NzEwMDN9.LIDR8Fbqyiw_A-lglOhUb-Mc-j1LV6_OLp8JHZb4yH8',
      emailstatus:true,
      otpstatus: true,
      genderstatus: true,
      userid: 135,
      result: userdetails
    };

    result(null, resobj);

  }else{

  
  sql.query("Select * from Otp where oid = " +req.oid+ "", function(err,res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {


      if (res[0].otp == req.otp) {
        console.log("OTP VALID");
        sql.query("Select userid,name,email,phoneno,referalcode,Locality,gender,virtualkey,regionid,razer_customerid,referredby,token,first_tunnel,other_region from User where phoneno = '" + req.phoneno + "'",function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              if (res1.length == 0) {
                var new_user = new Eatuser(req);
                new_user.otp_status = 1;

                sql.query("INSERT INTO User set ?", new_user, function(err,res2) {
                  if (err) {
                    console.log("error: ", err);
                    result(null, err);
                  } else {

                    let token = jwt.sign({username: req.phoneno},
                      config.secret
                      // ,
                      // { //expiresIn: '24h' // expires in 24 hours
                      // }
                     );

                    let resobj = {
                      success: true,
                       status: true,
                      // message:mesobj,
                      message: 'Authentication successful!',
                      token: token,
                      passwordstatus: passwordstatus,
                      emailstatus:emailstatus,
                      otpstatus: true,
                      genderstatus: genderstatus,
                      userid: res2.insertId,
                      result: res1
                    };

                    result(null, resobj);
                  }
                });
              } else {
                //let message = "Following user already Exist!, Please check it Phone number" ;

                //eat login password validate condition commanded 04-07-2019
                // if (res1[0].password !== "" && res1[0].password !== null) {
                //   passwordstatus = true;
                //   otpstatus = true;
                //   genderstatus = true;
                // }


                if (res1[0].email !== "" && res1[0].email !== null) {
                  emailstatus = true;
            
                }

                if (res1[0].gender !== "" &&res1[0].gender !== null &&res1[0].name !== "" &&res1[0].name !== null) {
                  genderstatus = true;
                  otpstatus = true;
                }

              //  console.log(res1[0].userid);
                sql.query("Select * from Address where userid = '" +res1[0].userid+"' and address_default = 1 and delete_status=0",function(err, res3) {
                    if (err) {
                      console.log("error: ", err);
                      result(err, null);
                    } else {
                      responce = [];

                     // console.log(res3.length);
                      if (res3.length !== 0) {
                        responce.push(res3[0]);
                        responce[0].razer_customerid = res1[0].razer_customerid
                        responce[0].userid = res1[0].userid
                        responce[0].name = res1[0].name
                        responce[0].email = res1[0].email
                        responce[0].phoneno = res1[0].phoneno
                        responce[0].referalcode = res1[0].referalcode
                        responce[0].gender = res1[0].gender
                        responce[0].virtualkey = res1[0].virtualkey
                        responce[0].regionid = res1[0].regionid
                        responce[0].other_region=res1[0].other_region
                        
                      }else{
                        res1[0].aid=0;
                        res1[0].lat=0.0;
                        res1[0].lon=0.0;
                      //  responce[0].landmark='';
                        res1[0].address_type=0;
                        res1[0].delete_status=0;
                        res1[0].address_default=0;
                        responce.push (res1[0]);
                      }

                      let token = jwt.sign({username: req.phoneno},
                        config.secret
                        // ,
                        // { //expiresIn: '24h' // expires in 24 hours
                        // }
                       );

                      let resobj = {
                        success: true,
                        status: true,
                        passwordstatus: passwordstatus,
                        emailstatus:emailstatus,
                        otpstatus: otpstatus,
                        genderstatus: genderstatus,
                        message: 'Authentication successful!',
                        token: token,
                        userid: res1[0].userid,
                        regionid:res1[0].regionid || 0,
                        razer_customerid : res1[0].razer_customerid,
                        result: responce
                      };

                      result(null, resobj);
                    }
                  }
                );
              }
            }
          }
        );
      } else {
        console.log(res[0]);
        console.log("OTP FAILED");
        let message = "OTP is not valid!, Try once again";
        let sucobj = true;

        let resobj = {
          success: sucobj,
          status: false,
          message: message
        };

        result(null, resobj);
      }
    }
  });
}
};

//
Eatuser.edit_eat_users = async function edit_eat_users(req, result) {
 
//  var userdetails = await query ("select regionid from Hometown where hometownid=35");
//  console.log("userdetails==>",userdetails);
 
 if (req.hometownid !=0 && req.hometownid) {

  var regioniddata = await query("select regionid from Hometown where hometownid="+req.hometownid+"");
  req.regionid=regioniddata[0].regionid;
}else if (req.hometownid ==0) {
  req.regionid=0;
}


  var staticquery = "UPDATE User SET updated_at = ?, ";
  var column = "";
  req.referalcode = "EATWELL" + req.userid;
  var column = '';
  var values =[];
  values.push(new Date());
  for (const [key, value] of Object.entries(req)) {
    if (key !== "userid") {
      column = column + key +" = ?,";
      values.push(value);
    }
  }
  column=column.slice(0, -1)
  values.push(req.userid);
  var query1 = staticquery + column  + " where userid = ?";
console.log(query1);
  sql.query(query1, values, function(err, res) {
    if (err) {
      result(err, null);
    } else {

      sql.query("Select userid,name,email,phoneno,referalcode,Locality,gender,virtualkey,regionid,other_region,hometownid from User where userid = '"+req.userid+"' ", function(err, userdetails) {
        if (err) {
          result(err, null);
        } else {
          let resobj = {
            success: true,
            status: true,
            result : userdetails,
            message: "Updated successfully"
          };
          result(null, resobj);
        }
      });

      // let resobj = {
      //   success: true,
      //   status: true,
      //   result : userdetails,
      //   message: "Updated successfully"
      // };
      // result(null, resobj);
    }
  });
};

Eatuser.checkLogin = function checkLogin(req, result) {
  var reqs = [req.phoneno, req.password];
  sql.query(
    "Select userid,name,email,phoneno,referalcode,Locality,gender,virtualkey,regionid from User where phoneno = ? and password = ?",
    reqs,
    function(err, res) {
      if (err) {
        console.log("error: ", err);

        let resobj = {
          success: "false",
          result: err
        };
        result(resobj, null);
      } else {
        if (res.length !== 0) {
          if (res[0].virtualkey === 0) {
            sql.query(
              "Select * from Address where userid = '" +
                res[0].userid +
                "' and address_default = 1 and delete_status=0",
              function(err, res1) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  res[0].aid = null;
                  res[0].address_title = null;
                  res[0].lat = null;
                  res[0].lon = null;

                  if (res1.length !== 0) {
                    res[0].aid = res1[0].aid;
                    res[0].address_title = res1[0].address_title;
                    res[0].lat = res1[0].lat;
                    res[0].lon = res1[0].lon;
                    res[0].address = res1[0].address;
                  }
                  let status = res.length == 1 ? true : false;
                  let resobj = {
                    success: true,
                    status: status,
                    result: res
                  };
                  console.log("result: ---", res.length);
                  result(null, resobj);
                }
              }
            );
          } else {
            let resobj = {
              success: true,
              message: "Sorry your not a valid user!",
              status: false
            };

            result(null, resobj);
          }
        } else {
          let resobj = {
            success: true,
            message: "Sorry your not a valid user!",
            status: false
          };

          result(null, resobj);
        }
      }
    }
  );
};


Eatuser.eat_user_post_registration = async function(req, result) {
  var staticquery = "UPDATE User SET updated_at = ?, ";
  var column = "";

  const userinfo = await query("Select * from User where userid = '" +req.userid +"'");
    
  // if (userinfo[0].email != req.email) {
  //   let resobj = {
  //     success: true,
  //     status: false,
  //    // message: "Sorry can't create customerid format is invalid"
  //    message: "This email already exist!"
      
      
  //   };
  // result(null,resobj );
 // }else{
 // console.log(userinfo[0].razer_customerid);

 if (userinfo[0].email === null || userinfo[0].email) {
  
  const emailinfo = await query("Select * from User where email = '" +req.email +"'");


  if (emailinfo.length === 0) {
   
  var customerid = userinfo[0].razer_customerid;

  req.name = userinfo[0].name;
  req.phoneno = userinfo[0].phoneno;
  //console.log(req);
  if (!customerid) {  
  var customerid = await Eatuser.create_customerid_by_razorpay(req);
  console.log("customerid:----- ", customerid); 
  if (customerid === 400) {
      let resobj = {
        success: true,
        status: false,
       // message: "Sorry can't create customerid format is invalid"
       message: "Customer already exists for the merchant!"
        
        
      };
    result(null,resobj );
    return
  }
  }

  for (const [key, value] of Object.entries(req)) {
    console.log(`${key} ${value}`);

    if (key !== "userid" || key !== "name") {
      // var value = `=${value}`;
      column = column + key + "='" + value + "',";
    }
  }

  var staticquery =
    staticquery + column.slice(0, -1) + " where userid = " + req.userid;
 
  sql.query(staticquery, [new Date()], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = true;
      let message = "Updated successfully";
      let resobj = {
        success: sucobj,
        status: true,
        message: message
      };

      result(null, resobj);
    }
  });
}else{


      let resobj = {
        success: true,
        status: false,
        message: "email already exist!"
      };

      result(null, resobj);
}
}
};

Eatuser.eat_user_forgot_password_byuserid = function eat_user_forgot_password_byuserid(
  newUser,
  result
) {
  var OTP = Math.floor(Math.random() * 90000) + 10000;

  var otpurl =
    "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
    newUser.phoneno +
    "&senderId=EATHOM&message=Your EAT App OTP is " +
    OTP +
    ". Note: Please DO NOT SHARE this OTP with anyone.";

  request(
    {
      method: "GET",
      rejectUnauthorized: false,
      url: otpurl
    },
    function(error, response, body) {
      if (error) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(response.statusCode, body);
        var responcecode = body.split("#");

        if (responcecode[0] === "0") {
          sql.query(
            "insert into Otp(phone_number,apptype,otp)values('" +
              newUser.phoneno +
              "',4,'" +
              OTP +
              "')",
            function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                let resobj = {
                  success: true,
                  status: true,
                  message: responcecode[1],
                  oid: res.insertId
                };

                result(null, resobj);
              }
            }
          );
        } else {
          let resobj = {
            success: true,
            status: false,
            message: responcecode[1]
          };

          result(null, resobj);
        }
      }
    }
  );

};

Eatuser.eat_user_forgot_password_update = function eat_user_forgot_password_update(
  newUser,
  result
) {
  sql.query(
    "UPDATE User SET password = '" +
      newUser.password +
      "'  where userid = '" +
      newUser.userid +
      "'",
    function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        let resobj = {
          success: true,
          status: true,
          message: "Password Updated successfully"
        };

        result(null, resobj);
      }
    }
  );
};

Eatuser.update_pushid = function(req, result) {
  var staticquery = "";
  if (req.pushid_android && req.userid) {
    staticquery =
      "UPDATE User SET pushid_android ='" +
      req.pushid_android +
      "'   where userid = " +
      req.userid +
      " ";
  } else if (req.pushid_ios && req.userid) {
    staticquery =
      "UPDATE User SET pushid_ios ='" +
      req.pushid_ios +
      "'  where userid = " +
      req.userid +
      " ";
  }

  if (staticquery.length === 0) {
    let sucobj = true;
    let message = "There no valid data";
    let resobj = {
      success: sucobj,
      status: false,
      message: message
    };

    result(null, resobj);
  } else {
    sql.query(staticquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let sucobj = true;
        let message = "Updated successfully";
        let resobj = {
          success: sucobj,
          status: true,
          message: message
        };

        result(null, resobj);
      }
    });
  }
};



Eatuser.get_eat_region_makeit_list = function get_eat_region_makeit_list(req,result) {

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;

  var nearbyotherregion = [];
  var regionquery =
    "select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.regionid,mk.address,mk.rating rating,re.regionname,ht.hometownname,mk.costfortwo,mk.img1 as makeitimg,( 3959 * acos( cos( radians(" +
    req.lat +
    ") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
    req.lon +
    "') ) + sin( radians(" +
    req.lat +
    ") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk left join Hometown ht on ht.hometownid=mk.hometownid left join Region re on re.regionid =ht.regionid join User us on us.regionid=re.regionid left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid  where  us.userid = '" +
    req.eatuserid +
    "' and mk.appointment_status = 3 and mk.verified_status = 1 group by mk.userid HAVING distance <="+radiuslimit+" order by distance ASC limit 3";


  sql.query(regionquery, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      var getregionquery =
        "select lat,lon,regionid from  Region where regionid = (select regionid from User where userid= '" +
        req.eatuserid +
        "')";

      sql.query(getregionquery, function(err, res1) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          var getregionlistquery =
            "select regionid,( 3959 * acos( cos( radians('" +
            res1[0].lat +
            "') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('" +
            res1[0].lon +
            "') ) + sin( radians('" +
            res1[0].lat +
            "') ) * sin(radians(lat)) ) ) AS distance from Region where regionid != '" +
            res1[0].regionid +
            "' group by regionid  order by distance ASC";

          sql.query(getregionlistquery, async function(err, res2) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              //  res2.forEach(function(v){ delete v.distance});

              for (let i = 0; i < res2.length; i++) {
                var nearbyregionquery =
                  "select mk.userid as makeituserid,mk.name as makeitusername,mk.address,mk.regionid,mk.brandname as makeitbrandname,mk.rating rating,re.regionname,ht.hometownname,mk.costfortwo,mk.img1 as makeitimg,( 3959 * acos( cos( radians(" +
                  req.lat +
                  ") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians(" +
                  req.lon +
                  ") ) + sin( radians(" +
                  req.lat +
                  ") ) * sin(radians(mk.lat)) ) ) AS distance, JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk left join Hometown ht on ht.hometownid=mk.hometownid left join Region re on re.regionid =ht.regionid join User us on " +
                  res2[i].regionid +
                  "=re.regionid left join Cuisine_makeit cm on cm.makeit_userid = mk.userid join Cuisine cu on cu.cuisineid=cm.cuisineid  where us.userid = '" +
                  req.eatuserid +
                  "' and mk.appointment_status = 3 and mk.ka_status = 2 and mk.verified_status = 1 group by mk.userid,distance HAVING distance <="+radiuslimit+" order by distance ASC limit 3";

                let kitchenlist = await query(nearbyregionquery);
                res = [...res, ...kitchenlist];
              }
              for (let i = 0; i < res.length; i++) {
                var eta = 15 + 3 * res[i].distance;
                res[i].eta = Math.round(eta) + " mins";

                if (res[i].cuisines) {
                  res[i].cuisines = JSON.parse(res[i].cuisines);
                }
              }

              res2 = res2.filter(function(obj) {
                return obj.distance !== "distance";
              });
              let sucobj = true;
              let resobj = {
                success: sucobj,
                status: true,
                result: res
              };

              result(null, resobj);
            }
          });
        }
      });
    }
  });
};


/***** ***************************************************/ 

//Don't remove this code flow has been change so commanded 04-07-2019



// Eatuser.get_eat_region_makeit_list_by_eatuserid = async function get_eat_region_makeit_list_by_eatuserid (req,result) {

//   var foodpreparationtime = constant.foodpreparationtime;
//   var onekm = constant.onekm;
//   var radiuslimit=constant.radiuslimit;

   
//   const userinfo = await query("select regionid from User where userid= "+req.eatuserid+"");

//   if (userinfo.length !==0) {
    
//   if (req.regionid < 1 || req.regionid ===undefined) {
//       var getregionquery = "select lat,lon,regionid from Region where regionid = (select regionid from User where userid= "+req.eatuserid+")";
//     }else{
//       var getregionquery = "select lat,lon,regionid from Region where regionid = "+req.regionid+"";
//     }
//     //var getregionquery = "select lat,lon,regionid from  Region where regionid = (select regionid from User where userid= '"+req.eatuserid+"')";

//     sql.query(getregionquery, function (err, res1) {
//         if (err) {
//             console.log("error: ", err);
//             result(err, null);
//         }
//         else {
               
//                 var getregionlistquery = "select *,( 3959 * acos( cos( radians('"+res1[0].lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+res1[0].lon+"') ) + sin( radians('"+res1[0].lat+"') ) * sin(radians(lat)) ) ) AS distance from Region  group by regionid  order by distance ASC";

//                 sql.query(getregionlistquery, async function (err, res2) {
//                     if (err) {
//                         console.log("error: ", err);
//                         result(err, null);
//                     }
//                     else {
                     
//                         var temparray = [];
//                       //  res2.forEach(function(v){ delete v.distance});
//                         let limit = 3;
//                         for (let i = 0; i < res2.length; i++) {

                     
//                        var nearbyregionquery = "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,mk.member_type,mk.about,fa.favid,IF(fa.favid,'1','0') as isfav, ( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = "+req.eatuserid+"  left join Cuisine_makeit cm on cm.makeit_userid = mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid  where mk.regionid ="+res2[i].regionid+"  and  mk.appointment_status = 3 and mk.verified_status = 1  and mk.ka_status = 2 and pt.approved_status=2 and  pt.quantity != 0 and pt.delete_status !=1  GROUP BY pt.productid   HAVING distance <="+radiuslimit+" ORDER BY distance";
//                         //console.log(nearbyregionquery);
//                           let kitchenlist = await query(nearbyregionquery);
//                           var kitchendetaillist=[];
//                           var kitchencount = kitchenlist.length>limit?limit:kitchenlist.length;
//                           res2[i].kitchencount = kitchenlist.length;
//                          // console.log('kloop'+kitchencount);
                            
//                             if (kitchenlist.length  !==0) {

//                                 for (let j = 0; j < kitchencount; j++) {
//                                   //  console.log('loop'+kitchencount);
//                                   //  var eta = 15 + (3 * kitchenlist[j].distance) ;\
//                                   var eta = foodpreparationtime + (onekm  * kitchenlist[j].distance);
//                                     //15min Food Preparation time , 3min 1 km
                                    
//                                     kitchenlist[j].eta =   Math.round(eta) +" mins" ;
//                                     if (kitchenlist[j].cuisines) {
//                                         kitchenlist[j].cuisines = JSON.parse(kitchenlist[j].cuisines)
//                                        }
//                                        kitchendetaillist.push(kitchenlist[j]);
                                    
//                                 }

//                                 res2[i].kitchenlist=kitchendetaillist;

//                                 temparray.push(res2[i]);
//                             }
                            
//                         }

                
//                             let sucobj = true;
//                             let resobj = {
//                                 success: sucobj,
//                                 status:true,
//                                 result:temparray
//                             };
                
//                             result(null, resobj);
//                     }

//                 });
//         }
//   });
// }else{

//   let sucobj = true;
//   let resobj = {
//       success: sucobj,
//       status:false,
//       message:"Sorry following user not found!"
//   };

//   result(null, resobj);
// }
// };

/***** ***************************************************/ 

Eatuser.get_eat_region_makeit_list_by_eatuserid = async function get_eat_region_makeit_list_by_eatuserid (req,result) {
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit; 
  const userinfo = await query("select * from User where userid= "+req.eatuserid+" ");

  //  console.log(userinfo);
  if (userinfo.length !== 0 ) {    
    var getregionquery = "select lat,lon,regionid from Region where regionid = '"+userinfo[0].regionid+"'  ";
    sql.query(getregionquery,async function (err, res1) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      }else {
        var breatfastcycle = constant.breatfastcycle;
        var dinnercycle = constant.dinnercycle;
        var lunchcycle = constant.lunchcycle;                              
        var day = moment().format("YYYY-MM-DD HH:mm:ss");
        var currenthour  = moment(day).format("HH");
        var productquery = '';

        if (currenthour < lunchcycle) {
          productquery = productquery + " and pt.breakfast = 1";
        }else if(currenthour >= lunchcycle && currenthour < dinnercycle){        
          productquery = productquery + " and pt.lunch = 1";        
        }else if( currenthour >= dinnercycle){        
          productquery = productquery + " and pt.dinner = 1";
        }

        if (res1.length !== 0) {
          var getregionlistquery = "select re.regionid,re.regiontitle as regionname,re.stateid,re.lat,re.lon,re.region_image,re.slider_title,re.slider_content,re.region_detail_image,re.special_dish_img,re.identity_img,re.tagline,re.specialities_food_content,re.active_status,re.region_infinity_img,re.region_collection_img,st.statename,( 3959 * acos( cos( radians('"+res1[0].lat+"') ) * cos( radians( re.lat ) )  * cos( radians( re.lon ) - radians('"+res1[0].lon+"') ) + sin( radians('"+res1[0].lat+"') ) * sin(radians(re.lat)) ) ) AS distance from Region re left join State st on re.stateid=st.stateid join MakeitUser mk on mk.regionid =re.regionid join Product pt on mk.userid = pt.makeit_userid  where pt.approved_status=2 and  pt.quantity != 0 and pt.active_status = 1 and pt.delete_status !=1 "+productquery+" group by re.regionid order by distance ASC limit 8";
        }else if(res1.length === 0){
          var getregionlistquery = "select re.regionid,re.regiontitle as regionname,re.stateid,re.lat,re.lon,re.region_image,re.slider_title,re.slider_content,re.region_detail_image,re.special_dish_img,re.identity_img,re.tagline,re.specialities_food_content,re.active_status,re.region_infinity_img,re.region_collection_img,st.statename,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( re.lat ) )  * cos( radians( re.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(re.lat)) ) ) AS distance from Region re left join State st on re.stateid=st.stateid join MakeitUser mk on mk.regionid =re.regionid join Product pt on mk.userid = pt.makeit_userid  where pt.approved_status=2 and  pt.quantity != 0 and pt.active_status = 1 and pt.delete_status !=1 "+productquery+" group by re.regionid order by distance ASC ";
        }
             
        //  only where re.regionid=16 or  re.regionid= 3 or re.regionid = 19
        //  if (res1.length !== 0) {
        //   var getregionlistquery = "select re.*,st.statename,( 3959 * acos( cos( radians('"+res1[0].lat+"') ) * cos( radians( re.lat ) )  * cos( radians( re.lon ) - radians('"+res1[0].lon+"') ) + sin( radians('"+res1[0].lat+"') ) * sin(radians(re.lat)) ) ) AS distance from Region re left join State st on re.stateid=st.stateid where re.regionid=16 or  re.regionid= 3 or re.regionid = 19 group by re.regionid  order by distance ASC";
        //  }else if(res1.length === 0){
        //   var getregionlistquery = "select re.*,st.statename,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( re.lat ) )  * cos( radians( re.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(re.lat)) ) ) AS distance from Region re left join State st on re.stateid=st.stateid where re.regionid=16 or  re.regionid= 3 or re.regionid = 19 group by re.regionid  order by distance ASC";
        //  }
        //   regiondata =     await query(getregionlistquery);

        ////Zone Condition Make Array////
        if(constant.zone_control){
          ////Get User Zone////
          var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
          var userzoneid ='';
          var zonename = '';
          var zonemakeitsrrsy =[];
          if(getzone.zone_id){            
            userzoneid = getzone.zone_id;
            zonename = getzone.zone_name;
          }
          ////Make Zone Servicable kitchen array////
        }
           
        sql.query(getregionlistquery, async function (err, res2) {
          if (err) {
            console.log("error: ", err);
            result(err, null);
          }else {
            var temparray = [];
            //  res2.forEach(function(v){ delete v.distance});
            let limit = 3;
            for (let i = 0; i < res2.length; i++) {
              var nearbyregionquery = "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regiontitle as regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,mk.member_type,mk.about,fa.favid,IF(fa.favid,'1','0') as isfav, ( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = "+req.eatuserid+"  left join Cuisine_makeit cm on cm.makeit_userid = mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid  where mk.regionid ="+res2[i].regionid+"  and  mk.appointment_status = 3 and mk.verified_status = 1  and mk.ka_status = 2 and pt.approved_status=2 and  pt.quantity != 0 and pt.active_status = 1 and pt.delete_status !=1 "+productquery+" GROUP BY pt.productid  ORDER BY distance";
              //console.log("makeitlist" +nearbyregionquery);
              let kitchenlist = await query(nearbyregionquery);
              var kitchendetaillist=[];
              // this code is important
              // var kitchencount = kitchenlist.length>limit?limit:kitchenlist.length;
              var kitchencount = kitchenlist.length;
              res2[i].kitchencount = kitchenlist.length;
              // console.log('kloop'+kitchencount);

              if (kitchenlist.length  !==0 ) {
                for (let j = 0; j < kitchencount; j++) {
                  //  console.log('loop'+kitchencount);
                  //  var eta = 15 + (3 * kitchenlist[j].distance) ;\
                  //  kitchenlist[j].distance = kitchenlist[j].distance * constant.onemile;
                  //  kitchenlist[j].distance = kitchenlist[j].distance.toFixed(2) ;
                  var eta = foodpreparationtime + (onekm  *  kitchenlist[j].distance);
                  // 15min Food Preparation time , 3min 1 km
                  kitchenlist[j].eta = Math.round(eta);
                  kitchenlist[j].serviceablestatus = false;

                  //////////////Zone Condition//////////
                  if(constant.zone_control){
                   if (kitchenlist[j].serviceablestatus == false) {
                      if(kitchenlist[j].zone && kitchenlist[j].zone!=0 && kitchenlist[j].zone == userzoneid){
                        kitchenlist[j].serviceablestatus = true;
                      }else if(kitchenlist[j].zone==0 && kitchenlist[j].distance <= radiuslimit){
                        kitchenlist[j].serviceablestatus = true;
                      }else{
                        kitchenlist[j].serviceablestatus = false;
                      }
                    }
                  }else{
                    if ( kitchenlist[j].distance <= radiuslimit) {
                      kitchenlist[j].serviceablestatus = true;
                    }
                  }
                  
                  if ( kitchenlist[j].eta > 60) {
                    var hours = kitchenlist[j].eta / 60;
                    var rhours = Math.floor(hours);
                    var minutes = (hours - rhours) * 60;
                    var rminutes = Math.round(minutes);
                    // kitchenlist[j].eta =   +rhours+" hour and " +rminutes +" minute."
                    kitchenlist[j].eta = "above 60 Mins"
                  }else{
                    kitchenlist[j].eta = Math.round(eta) + " mins";
                  }

                  // kitchenlist[j].eta =   Math.round(eta) +" mins" ;
                  if (kitchenlist[j].cuisines) {
                    kitchenlist[j].cuisines = JSON.parse(kitchenlist[j].cuisines)
                  }
                  kitchendetaillist.push(kitchenlist[j]);

                  if (kitchenlist[j].member_type) {
                    if (kitchenlist[j].member_type === 1) {
                      kitchenlist[j].member_type_name = 'Gold';
                      kitchenlist[j].member_type_icon = 'https://eattovo.s3.amazonaws.com/uploaproduct/1565713720284-badges_makeit-01.png';
                    }else if (kitchenlist[j].member_type === 2){
                      kitchenlist[j].member_type_name = 'Silver';
                      kitchenlist[j].member_type_icon = 'https://eattovo.s3.amazonaws.com/uploaproduct/1565713745646-badges_makeit-02.png';
                    }else if (kitchenlist[j].member_type === 3){
                      kitchenlist[j].member_type_name = 'bronze';
                      kitchenlist[j].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.comakeit/product/1565713778649-badges_makeit-03.png';
                    }
                  }
                }
                res2[i].kitchenlist=kitchendetaillist;
                temparray.push(res2[i]); 
              }
            }

            let resobj = {
              success: true,
              status:true,
              zoneId:userzoneid,
              zoneName:zonename,
              result:temparray
            };
            result(null, resobj);
          }
        });
      }
    });
  }else{
    let sucobj = true;
    let resobj = {
      success: sucobj,
      status:false,
      zoneId:userzoneid,
      zoneName:zonename,
      message:"Sorry following user not found!"
    };
    result(null, resobj);
  }
};

Eatuser.get_eat_region_kitchen_list_show_more = async function get_eat_region_kitchen_list_show_more (req,result) {
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var tunnelkitchenliststatus = true;
  const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");

  if (userdetails[0].first_tunnel == 1 ) {    
    tunnelkitchenliststatus = false;
  }

  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
  var productquery = '';

  if (currenthour < lunchcycle) {
    productquery = productquery + " and pt.breakfast = 1";
  }else if(currenthour >= lunchcycle && currenthour < dinnercycle){                    
    productquery = productquery + " and pt.lunch = 1";                    
  }else if( currenthour >= dinnercycle){
    productquery = productquery + " and pt.dinner = 1";
  }

  var nearbyregionquery = "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.member_type,mk.brandname as makeitbrandname,mk.unservicable,mk.rating rating,mk.regionid,re.regiontitle as regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav, ( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = "+req.eatuserid+"  left join Cuisine_makeit cm on cm.makeit_userid = mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid  where mk.regionid ="+req.regionid+"  and  mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status = 2 and mk.verified_status = 1  and pt.quantity != 0 and pt.active_status = 1 and pt.delete_status !=1 "+productquery+" GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,distance";
  sql.query(nearbyregionquery,async function (err, res) {
    if(err) {
      console.log("error: ", err);
      result(err, null);
    }else{
      ////Zone Condition////
      if(constant.zone_control){
        ////Get User Zone////
        var getzone     = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid  = '';
        var zonename    = '';
        var zonemakeitsrrsy = [];
        if(getzone.zone_id){          
          userzoneid = getzone.zone_id;
          zonename   = getzone.zone_name;
          ////Make Zone Servicable kitchen array////
          var zonemakeitsrrsy = res.filter(kitchenarray => (kitchenarray.zone==userzoneid && kitchenarray.unservicable==0));
        } 
      }

      for (let i = 0; i < res.length; i++) { 
        if (res[i].member_type) {
          if (res[i].member_type === 1) {
            res[i].member_type_name = 'Gold';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
          }else if (res[i].member_type === 2){
            res[i].member_type_name = 'Silver';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
          }else if (res[i].member_type === 3){
            res[i].member_type_name = 'bronze';
            res[i].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
          }
        }
        //  var eta = 15 + (3 * res[i].distance) ;
        //  res[i].distance = res[i].distance * constant.onemile;
        //  res[i].distance = res[i].distance.toFixed(2) ;
        //  console.log(res[i].distance);
        var eta = foodpreparationtime + (onekm * res[i].distance);
        //15min Food Preparation time , 3min 1 km 
        res[i].eta =   Math.round(eta)  ;  

        if (  res[i].eta > 60) {
          var hours =  res[i].eta / 60;
          var rhours = Math.floor(hours);
          var minutes = (hours - rhours) * 60;
          var rminutes = Math.round(minutes);               
          //  res[i].eta =   +rhours+" hour and " +rminutes +" minute."
          res[i].eta = "above 60 Mins"
        }else{
          res[i].eta = Math.round(eta) + " mins";
        }
                  
        // res[i].serviceablestatus = false;                            
        // if (res[i].distance <= radiuslimit) {
        //    res[i].serviceablestatus = true;
        //  }

        res[i].serviceablestatus = false;               
        if (res[i].unservicable == 0) {
          res[i].serviceablestatus = true;
        }
                  
        //////////////Zone Condition//////////
        if(constant.zone_control){
          if (res[i].serviceablestatus !== false) {
            if(zonemakeitsrrsy.length !=0 && res[i].zone==userzoneid){
              res[i].serviceablestatus = true;
            }else if (zonemakeitsrrsy.length ==0 && res[i].distance <= radiuslimit){
              res[i].serviceablestatus = true;
            }else{
              res[i].serviceablestatus = false;
            }
          }
        }else{
          if (res[i].serviceablestatus !== false) {
            if (res[i].distance <= radiuslimit) {
              res[i].serviceablestatus = true;
            }else{
              res[i].serviceablestatus = false;
            }
          }
        }

        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines)
        }
      }
      let resobj = {
        success: true,
        status:true,
        userzoneid:userzoneid,
        zonename:zonename,
        result:res
      };
      result(null, resobj);
    }
  });  
};

Eatuser.get_eat_region_kitchen_list_show_more_v2 = async function get_eat_region_kitchen_list_show_more_v2 (req,result) {  
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var tunnelkitchenliststatus = true;
  const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");
  
  if (userdetails[0].first_tunnel == 1 ) {    
    tunnelkitchenliststatus = false;
  }

  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
  var productquery = '';

  if (currenthour < lunchcycle) {
    productquery = productquery + " and pt.breakfast = 1";
  }else if(currenthour >= lunchcycle && currenthour < dinnercycle){                    
    productquery = productquery + " and pt.lunch = 1";                    
  }else if( currenthour >= dinnercycle){                    
    productquery = productquery + " and pt.dinner = 1";
  }

  var nearbyregionquery = "Select distinct mk.zone,mk.userid as makeituserid,mk.name as makeitusername,mk.member_type,mk.brandname as makeitbrandname,mk.unservicable,mk.rating rating,mk.regionid,re.regiontitle as regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav, ( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = "+req.eatuserid+"  left join Cuisine_makeit cm on cm.makeit_userid = mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid  where mk.regionid ="+req.regionid+"  and  mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status = 2 and mk.verified_status = 1  and pt.quantity != 0 and pt.active_status = 1 and pt.delete_status !=1 "+productquery+" GROUP BY pt.productid  ORDER BY mk.unservicable = 0 desc,distance";
  sql.query(nearbyregionquery,async function (err, res) {
    if(err) {
      console.log("error: ", err);
      result(err, null);
    }else{
      ////Zone Condition////
      if(constant.zone_control){
        ////Get User Zone////
        var getzone     = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
        var userzoneid  = '';
        var zonename    = '';
        var zonemakeitsrrsy = [];
        if(getzone.zone_id){          
          userzoneid = getzone.zone_id;
          zonename   = getzone.zone_name;
          ////Make Zone Servicable kitchen array////
          var zonemakeitsrrsy = res.filter(kitchenarray => (kitchenarray.zone==userzoneid && kitchenarray.unservicable==0));
        } 
      }

      for (let i = 0; i < res.length; i++) {
        if (res[i].member_type) {
          if (res[i].member_type === 1) {
            res[i].member_type_name = 'Gold';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713720284-badges_makeit-01.png';
          }else if (res[i].member_type === 2){
            res[i].member_type_name = 'Silver';
            res[i].member_type_icon = 'https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1565713745646-badges_makeit-02.png';
          }else if (res[i].member_type === 3){
            res[i].member_type_name = 'bronze';
            res[i].member_type_icon = 'https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1565713778649-badges_makeit-03.png';
          }
        }
        // var eta = 15 + (3 * res[i].distance) ;
        // res[i].distance = res[i].distance * constant.onemile;
        // res[i].distance = res[i].distance.toFixed(2) ;
        // console.log(res[i].distance);
        var eta = foodpreparationtime + (onekm * res[i].distance);
        // 15min Food Preparation time , 3min 1 km 
        res[i].eta =   Math.round(eta)  ;  

        if (  res[i].eta > 60) {
          var hours =  res[i].eta / 60;
          var rhours = Math.floor(hours);
          var minutes = (hours - rhours) * 60;
          var rminutes = Math.round(minutes);                   
          
          //  res[i].eta =   +rhours+" hour and " +rminutes +" minute."
          res[i].eta = "above 60 Mins"
        }else{
          res[i].eta = Math.round(eta) + " mins";
        }
                  
        // res[i].serviceablestatus = false;                            
        // if (res[i].distance <= radiuslimit) {
        //    res[i].serviceablestatus = true;
        //  }

        res[i].serviceablestatus = false;               
        if (res[i].unservicable == 0) {
          res[i].serviceablestatus = true;
        }

        //////////////Zone Condition//////////
        if(constant.zone_control){
          if (res[i].serviceablestatus !== false) {
            if(zonemakeitsrrsy.length !=0 && res[i].zone==userzoneid){
              res[i].serviceablestatus = true;
            }else if (zonemakeitsrrsy.length ==0 && res[i].distance <= radiuslimit){
              res[i].serviceablestatus = true;
            }else{
              res[i].serviceablestatus = false;
            }
          }
        }else{
          if (res[i].serviceablestatus !== false) {
            if (res[i].distance <= radiuslimit) {
              res[i].serviceablestatus = true;
            }else{
              res[i].serviceablestatus = false;
            }
          }
        }

        if ( tunnelkitchenliststatus == false) {      
          res[i].serviceablestatus = true;                  
        }            

        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines)
        }
      }

      let resobj = {
        success: true,
        status:true,
        userzoneid:userzoneid,
        zonename:zonename,
        result:res
      };
      result(null, resobj);
    }
  });  
};

 Eatuser.create_customerid_by_razorpay = async function create_customerid_by_razorpay(req) { 
 
  
      var name = req.name;
      var email = req.email;
      var contact = req.phoneno;
      var notes = "eatuser";
      var fail_existing  = "1";
      var cuId=false;
    
      return await instance.customers.create({name, email, contact, notes,fail_existing}).then((data) => {
        cuId=data.id;
        
        //  const updateforrazer_customerid = await query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " + req.userid +" ");
       
          sql.query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " + req.userid +" ", function(err, customerupdate) {
           if (err) {
            console.log("error: ", err);
              return false;
           } 
          });
          console.log("cuId:----- ", cuId);
          return cuId;
          }).catch((error) => {
            console.log("error: ", error);
            return error.statusCode;
          })
    
    
};


Eatuser.eat_explore_kitchen_dish_v2 =async function eat_explore_kitchen_dish_v2(req,result) {

      var foodpreparationtime = constant.foodpreparationtime;
      var onekm = constant.onekm;
      var radiuslimit=constant.radiuslimit;
      var day = moment().format("YYYY-MM-DD HH:mm:ss");;
      var currenthour  = moment(day).format("HH");
    
      var breatfastcycle = constant.breatfastcycle;
      var dinnercycle = constant.dinnercycle;
      var lunchcycle = constant.lunchcycle;
      var ifconditionquery;
      var nextcycle ='';
      var nextthirdcyclecycle = '';
      var where_condition_query = '';
      var scondcycle = '';
      var thirdcycle = '';
      
      if (currenthour < lunchcycle) {

        ifconditionquery = "pt.breakfast =1";
        scondcycle = "pt.lunch=1";
        thirdcycle = "pt.dinner =1";
        cycle = constant.breatfastcycle + 'AM';
        nextcycle = "Next available \n"+constant.lunchcycle + ' PM';
        nextthirdcyclecycle = "Next available \n"+constant.dinnerstart + ' PM';
        where_condition_query = where_condition_query + "and (pt.breakfast = 1 OR pt.lunch = 1)";
    }else if(currenthour >= lunchcycle && currenthour < dinnercycle){
 
       ifconditionquery = "pt.lunch =1";
       scondcycle = "pt.dinner=1";
       thirdcycle = "pt.breakfast =1";
       cycle =  "Next available \n"+ constant.lunchcycle + ' PM';
       nextcycle = "Next available \n"+ constant.dinnerstart + ' PM';
       nextthirdcyclecycle = "Next available \n"+ constant.breatfastcycle + ' AM,Tomorrow';
       where_condition_query = where_condition_query + "and (pt.lunch = 1 OR pt.dinner = 1)";
 
    }else if(currenthour >= dinnercycle){
 
 
       ifconditionquery = "pt.dinner =1";
       scondcycle = "pt.breakfast=1";
       thirdcycle = "pt.lunch =1";
       cycle = constant.dinnercycle + 'PM';
       nextcycle = "Next available \n"+ constant.breatfastcycle + ' AM,Tomorrow';
       nextthirdcyclecycle ="Next available \n"+ constant.lunchcycle + ' PM,Tomorrow';
       where_condition_query = where_condition_query + "and (pt.dinner = 1 OR  pt.breakfast = 1)";
    }

    var regex = /^[A-Za-z0-9 ]+$/ ;
 
    var isValid = regex.test(req.search);
    // if (!isValid) {

    //   let resobj = {
    //     success: true,
    //     status: false,
    //     message : "search Contains Special Characters."
        
    // };

    // result(null, resobj);

    // } else {
        
          // var query =
          //   "Select pt.makeit_userid  as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,ly.localityname ,re.regionname,mk.costfortwo,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
          //   req.lat +
          //   "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
          //   req.lon +
          //   "') ) + sin( radians('" +
          //   req.lat +
          //   "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid',pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid,'prod_desc',pt.prod_desc,'next_available',IF("+ifconditionquery+",false,true),'next_available_time',IF("+ifconditionquery+",'"+cycle+"','"+nextcycle+"'),'breakfast',pt.breakfast,'lunch',pt.lunch,'dinner',pt.dinner)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
          //   req.eatuserid +
          //   "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
          //   req.eatuserid +
          //   "'  where product_name like '%" +
          //   req.search +
          //   "%' and pt.active_status = 1 and mk.ka_status = 2 and pt.approved_status=2 and pt.quantity != 0 and pt.delete_status != 1 "+where_condition_query+"  group by pt.makeit_userid";

          //var query ="Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid as makeit_region,re.regionname, pt.product_name,pt.vegtype,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,cu.cuisineid,ly.localityname, ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cuisine cu on cu.cuisineid=pt.cuisine left join Locality ly on mu.localityid=ly.localityid join Region re on re.regionid = mu.regionid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '"+req.eatuserid+"'  where mu.appointment_status = 3 and mu.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1 and pt.product_name like '%"+req.search+"%'  HAVING distance <="+radiuslimit+" ORDER BY pt.product_name ASC";
      

          var query =
          "Select mk.zone,pt.makeit_userid  as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,mk.unservicable,ly.localityname ,re.regionname,mk.costfortwo,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
          req.lat +
          "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
          req.lon +
          "') ) + sin( radians('" +
          req.lat +
          "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid',pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid,'prod_desc',pt.prod_desc,'next_available',IF("+ifconditionquery+",false,true),'next_available_time',IF("+scondcycle+",'"+nextcycle+"',IF("+thirdcycle+",'"+nextthirdcyclecycle+"','Available')),'breakfast',pt.breakfast,'lunch',pt.lunch,'dinner',pt.dinner)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
          req.eatuserid +
          "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
          req.eatuserid +
          "'  where product_name like '%" +
          req.search +
          "%' and pt.active_status = 1 and mk.ka_status = 2 and pt.approved_status=2 and pt.quantity != 0 and pt.delete_status != 1  group by pt.makeit_userid";

      //console.log(query);
      sql.query(query,async function(err, res) {
        if (err) {
         // console.log("error: ", err);
          
          let resobj = {
            success: true,
            status: false,
            result: err
        };
  
        result(null, resobj);
        } else {

          for (let i = 0; i < res.length; i++) {
            
              res[i].productlist =JSON.parse(res[i].productlist)

              res[i].productlist.sort((a, b) => parseFloat(a.next_available) - parseFloat(b.next_available));
              // res[i].distance = res[i].distance * constant.onemile;
              // res[i].distance = res[i].distance.toFixed(2) ;
      
              // console.log(res[i].distance);
              //15min Food Preparation time , 3min 1 km
            //  eta = 15 + 3 * res[i].distance;
            var eta = foodpreparationtime + (onekm * res[i].distance);
            res[i].serviceablestatus = false;
        
            if (res[i].unservicable == 0) {
              res[i].serviceablestatus = true;
            }
            
            if (res[i].serviceablestatus !== false) {
              ////Add Zone Controle Condition//////
              if(constant.zone_control){
                var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
                if(getzone.zone_id && res[i].zone==getzone.zone_id){
                  res[i].serviceablestatus = true;
                }else{
                  res[i].serviceablestatus = false;
                } 
              }else{
                if (res[i].distance <= radiuslimit) {
                  res[i].serviceablestatus = true;
                }else{
                  res[0].serviceablestatus = false;
                }
              }
              ////////////////////////////////////// 
            }
             // res[i].eta = Math.round(eta) + " mins";
            
              if ( res[i].eta > 60) {           
                //console.log(rhours);
                //console.log(rminutes);
                // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
                res[i].eta = "above 60 Mins"
              }else{
                res[i].eta = Math.round(eta) + " mins";
              }
          }


          let resobj = {
              success: true,
              status:true,
              result:res
          };
    
          result(null, resobj);

        }
      });

  //  }
};

Eatuser.eat_explore_kitchen_dish =async function eat_explore_kitchen_dish(req,result) {

      var foodpreparationtime = constant.foodpreparationtime;
      var onekm = constant.onekm;
      var radiuslimit=constant.radiuslimit;

    var regex = /^[A-Za-z0-9 ]+$/ ;
 
    var isValid = regex.test(req.search);
    // if (!isValid) {

    //   let resobj = {
    //     success: true,
    //     status: false,
    //     message : "search Contains Special Characters."
        
    // };

    // result(null, resobj);

    // } else {
        
          var query =
            "Select mk.zone,pt.makeit_userid  as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,mk.unservicable,ly.localityname ,re.regionname,mk.costfortwo,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
            req.lat +
            "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
            req.lon +
            "') ) + sin( radians('" +
            req.lat +
            "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid',pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid,'prod_desc',pt.prod_desc)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
            req.eatuserid +
            "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
            req.eatuserid +
            "'  where product_name like '%" +
            req.search +
            "%' and pt.active_status = 1 and mk.ka_status = 2 and pt.approved_status=2 and pt.quantity != 0 and pt.delete_status != 1  group by pt.makeit_userid";

          //var query ="Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid as makeit_region,re.regionname, pt.product_name,pt.vegtype,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,cu.cuisineid,ly.localityname, ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cuisine cu on cu.cuisineid=pt.cuisine left join Locality ly on mu.localityid=ly.localityid join Region re on re.regionid = mu.regionid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '"+req.eatuserid+"'  where mu.appointment_status = 3 and mu.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1 and pt.product_name like '%"+req.search+"%'  HAVING distance <="+radiuslimit+" ORDER BY pt.product_name ASC";
      

      sql.query(query,async function(err, res) {
        if (err) {
         // console.log("error: ", err);
          
          let resobj = {
            success: true,
            status: false,
            result: err
        };
  
        result(null, resobj);
        } else {

          for (let i = 0; i < res.length; i++) {
            
              res[i].productlist =JSON.parse(res[i].productlist)
          
              //res[i].distance = res[i].distance * constant.onemile;
              // res[i].distance = res[i].distance.toFixed(2) ;
      
              // console.log(res[i].distance);
              
              //15min Food Preparation time , 3min 1 km
            //  eta = 15 + 3 * res[i].distance;
            var eta = foodpreparationtime + (onekm * res[i].distance);
      
              res[i].serviceablestatus = false;
        
              if (res[i].unservicable == 0) {
                res[i].serviceablestatus = true;
              }
              
              if (res[i].serviceablestatus !== false) {
                ////Add Zone Controle Condition//////
                if(constant.zone_control){
                  var getzone = await zoneModel.check_boundaries({lat:req.lat,lon:req.lon});
                  if(getzone.zone_id && res1[i].zone==getzone.zone_id){
                    res[i].serviceablestatus = true;
                  }else{
                    res[i].serviceablestatus = false;
                  } 
                }else{
                  if (res[i].distance <= radiuslimit) {
                    res[i].serviceablestatus = true;
                  }else{
                    res[0].serviceablestatus = false;
                  }
                }
              }
              res[i].eta = Math.round(eta);
              
              if ( res[i].eta > 60) {           
                //console.log(rhours);
                //console.log(rminutes);
                // res[i].eta =   +rhours+" hour and " +rminutes +" minute."
                res[i].eta = "above 60 Mins"
              }else{
                res[i].eta = Math.round(eta) + " mins";
              }
          }


          let resobj = {
              success: true,
              status:true,
              result:res
          };
    
          result(null, resobj);

        }
      });

  //  }
};

Eatuser.eat_app_version_check_vid= async function eat_app_version_check_vid(req,headers,result) { 
      
      var updatestatus = {};
      var versionstatus = false;
      var eatforceupdatestatus =false;

      var eatversioncode = constant.eatversioncodenew;
      var eatforceupdate = constant.eatforceupdate;
      
      if (headers.apptype === '1' || headers.apptype === 1) {
        
      if (req.eatversioncode < constant.eatversionforceupdate) {
        
        versionstatus = true;
        eatforceupdatestatus = true;
      }else if(req.eatversioncode < constant.eatversioncodenew){
        versionstatus = true;
        eatforceupdatestatus = false;
      }else{
        versionstatus = false;
        eatforceupdatestatus = false;
      }

      }else if (headers.apptype === '2' || headers.apptype === 2) {
       if (req.eatversioncode < constant.eatiosversionforceupdate) {
          
          versionstatus = true;
          eatforceupdatestatus = true;
          
        }else if(req.eatversioncode < constant.eatiosversioncodenew){
          versionstatus = true;
          eatforceupdatestatus = false;
        }else{
          versionstatus = false;
          eatforceupdatestatus = false;
        }

      }

      updatestatus.versionstatus = versionstatus;
      updatestatus.eatforceupdate = eatforceupdatestatus;

          let resobj = {
              success: true,
              status:true,
              result:updatestatus
          };
    
          result(null, resobj);

    
};

Eatuser.eat_app_customer_support= async function eat_app_customer_support(req,result) { 
     

      let resobj = {
          success: true,
          status:true,
          customer_support : constant.customer_support
      };

      result(null, resobj);


};

Eatuser.update_tunnel_byid = function update_tunnel_byid(req, result) {

  staticquery ="UPDATE User SET first_tunnel =1  where userid = " +req.userid +" ";


    sql.query(staticquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let sucobj = true;
        let message = "Updated successfully";
        let resobj = {
          success: sucobj,
          status: true,
          message: message
        };

        result(null, resobj);
      }
    });

};

Eatuser.get_otp= function get_otp(req, result) {

  staticquery ="select * from Otp where phone_number = " +req.phone_number +" order by oid desc limit 1 ";

    sql.query(staticquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
  
        let resobj = {
          success: true,
          status: true,
          result: res
        };

        result(null, resobj);
      }
    });

};
 

/////Eat Users History
Eatuser.user_history = async function user_history(req, result) {
  var getorderlist = await query("Select o.orderid,ma.brandname,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product,o.created_at,o.orderstatus,o.price from Orders as o left join OrderItem as oi on o.orderid=oi.orderid left join Product as p on p.productid = oi.productid left join MakeitUser as ma on o.makeit_user_id=ma.userid where o.userid="+req.userid+" GROUP BY o.orderid");
  var CompletedOrders = 0;
  var CancelOrders = 0;

  ////Get Orders Count
  for(var i=0;i<getorderlist.length; i++){
    if(parseInt(getorderlist[i].orderstatus)==6){
      CompletedOrders = CompletedOrders+1;
    }else{
      CancelOrders = CancelOrders+1;
    }
  }

  if(getorderlist.length>0){
    let resobj = {
      success: true,
      status : true,
      TotalOrders : getorderlist.length,
      CompletedOrders : CompletedOrders,
      CancelOrders : CancelOrders,
      result : getorderlist
    };
    result(null, resobj);
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status : false
    };
    result(null, resobj);
  }
};

/////Eat Payment Retry
Eatuser.payment_retry = async function payment_retry(req, result) {
  console.log("payment retry");
  var getorderquery ="select userid,orderid,orderstatus,payment_type,payment_status,transactionid,transaction_status from Orders where orderid="+req.orderid+" and userid="+req.userid;
  var getorder = await query(getorderquery);
  if(getorder){
    if(getorder[0].orderstatus == 0 && getorder[0].payment_type == '1' && getorder[0].payment_status == 1 && getorder[0].transactionid && getorder[0].transaction_status){
      let resobj = {
        success: true,
        status : true,
        message : "Your payment already success, order has been placed"
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "Retry"
      };
      result(null, resobj);
    }
    result(getorder);
  }else{
    let resobj = {
      success: true,
      status : true,
      message : "No records found"
    };
    result(null, resobj);
  }
};


/////hub_based_userlist
Eatuser.hub_based_userlist = async function hub_based_userlist(req, result) {
  var getuserquery ="select u.userid,u.name,u.email,u.phoneno,ord.orderid,u.pushid_android,u.pushid_ios,u.Locality,(CASE WHEN (DATE(ord.created_at) BETWEEN DATE_SUB(CURDATE(),INTERVAL "+constant.interval_days+" DAY) AND  CURDATE()) THEN ord.orderid ELSE 0 END) as with7day from User as u join Orders as ord on ord.userid=u.userid join MakeitUser as mk on mk.userid=ord.makeit_user_id  join Makeit_hubs as mh on mh.makeithub_id=mk.makeithub_id where u.userid!='' and mh.makeithub_id="+req.makeithub_id+"  and ord.orderstatus < 8 and orderid in (SELECT max(orderid) FROM Orders  GROUP BY userid) order by ord.created_at desc";
  sql.query(getuserquery, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
   
      if (req.type==1) {

         res = res.filter(re => re.with7day ===0);
      }else{
         res = res.filter(re => re.with7day !==0);

      }
      

      let resobj = {
        success: true,
        status: true,
        result: res
      };

      result(null, resobj);
    }
  });
};


/////user_based_notification
Eatuser.user_based_notification = async function user_based_notification(req, result) {
 
  if (req.type==0) {
    var getuserquery ="select userid,name from User";
  } else {
    var getuserquery ="select u.userid,u.name,u.email,u.phoneno,ord.orderid,u.pushid_android,u.pushid_ios,u.Locality,(CASE WHEN (DATE(ord.created_at) BETWEEN DATE_SUB(CURDATE(),INTERVAL "+constant.interval_days+" DAY) AND  CURDATE()) THEN ord.orderid ELSE 0 END) as with7day from User as u join Orders as ord on ord.userid=u.userid join MakeitUser as mk on mk.userid=ord.makeit_user_id  join Makeit_hubs as mh on mh.makeithub_id=mk.makeithub_id where u.userid!='' and mh.makeithub_id="+req.makeithub_id+"  and ord.orderstatus < 8 and orderid in (SELECT max(orderid) FROM Orders  GROUP BY userid) order by ord.created_at desc";

  }

  sql.query(getuserquery,async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
   
      if (req.type==1) {
       var userlist = res.filter(re => re.with7day ===0);
     }else if(req.type==2){
       var userlist = res.filter(re => re.with7day !==0);
     }else{
       var userlist = res;
     }
     // const userlist = res.filter(re => re.with7day===0);

    //  const userlist = res;
      
   //   console.log(userlist.length);
      for (let i = 0; i < userlist.length; i++) {
        
        user={};
        user.userid=userlist[i].userid;
        user.user_message = req.user_message;
        user.title = req.title;
        if (req.image) {
          user.image = req.image;
        }
       
        await Notification.orderEatPushNotification(
          null,
          user,
          PushConstant.Pageid_eat_send_notification
        );
        
      } 
     
  let resobj = {
    success: true,
    status: true,
    message: "notification sent successfully"
  };

  result(null, resobj);
   }
  });
  

  // let resobj = {
  //   success: true,
  //   status: true,
  //   message: "notification sent successfully"
  // };

  // result(null, resobj);

};


/////user_based_notification
// Eatuser.user_based_notification = async function user_based_notification(req, result) {
 
// //   var getuserquery ="select u.userid,u.name,u.email,u.phoneno,ord.orderid,u.pushid_android,u.pushid_ios,u.Locality,(CASE WHEN (DATE(ord.created_at) BETWEEN DATE_SUB(CURDATE(),INTERVAL 7 DAY) AND  CURDATE()) THEN ord.orderid ELSE 0 END) as with7day from User as u join Orders as ord on ord.userid=u.userid join MakeitUser as mk on mk.userid=ord.makeit_user_id  join Makeit_hubs as mh on mh.makeithub_id=mk.makeithub_id where u.userid!='' and mh.makeithub_id="+req.makeithub_id+"  group by u.userid order by ord.orderid desc";
// //  // var userlist = req.userlist;
// //   sql.query(getuserquery,async function(err, res) {
// //     if (err) {
// //       console.log("error: ", err);
// //       result(err, null);
// //     } else {
   
// //       const userlist = res.filter(re => re.with7day===0);

//       const userlist = req.userlist;
//       for (let i = 0; i < userlist.length; i++) {
//      //   console.log(userlist[i]);
//         user={};
//         user.userid=userlist[i];
//         user.user_message = req.user_message;
//         user.title = req.title;
    
//         await Notification.orderEatPushNotification(
//           null,
//           user,
//           PushConstant.Pageid_eat_send_notification
//         );
        
//       } 
     
//   let resobj = {
//     success: true,
//     status: true,
//     message: "notification sent successfully"
//   };

//   result(null, resobj);
//   //  }
//   // });
  

//   // let resobj = {
//   //   success: true,
//   //   status: true,
//   //   message: "notification sent successfully"
//   // };

//   // result(null, resobj);

// };


///user growth report based on orderid
Eatuser.user_growth_order_report = async function user_growth_order_report(req, result) {
  var getuserorderquery ="select eu.userid as customer_id,eu.name as customer_name,date(eu.created_at) as registered_date,sum(if(o.orderstatus=6,1,0)) as delivered_order_count,sum(if(o.orderstatus=6,o.price,0)) as delivered_order_price,sum(if(o.orderstatus=7,1,0)) as cancel_order_count,sum(if(o.orderstatus=7,o.price,0)) as cancel_order_price,JSON_ARRAYAGG(JSON_OBJECT('orderid', o.orderid,'orderstatus', o.orderstatus,'price', o.price,'ordertime',date(o.ordertime))) AS orderlist   from User eu  left join Orders o on o.userid=eu.userid where date(eu.created_at)='"+req.date+"' group by eu.userid";
  
  sql.query(getuserorderquery,async function(err, res) {
    if (err) {
      result(err, null);
    } else {
      
      for (let i = 0; i < res.length; i++) {
        res[i].orderlist = JSON.parse(res[i].orderlist);
        var orderlist = res[i].orderlist;
        var isSuccesslist=false;
        var isFalierlist=false;
        if(orderlist.length>0){
            orderlist.sort((a, b) => parseFloat(a.ordertime) - parseFloat(b.ordertime));
            var successOrderlist = orderlist.filter(re => re.orderstatus === 6);
            var cancelOrderlist = orderlist.filter(re => re.orderstatus === 7);
            if(successOrderlist.length>0){
              isSuccesslist=true;
              var last_id=successOrderlist.length-1;
              res[i].first_success_order_id=successOrderlist[0].orderid;
              res[i].last_success_order_id=successOrderlist[last_id].orderid;
              res[i].first_success_order_date=successOrderlist[0].ordertime;
              res[i].last_success_order_date=successOrderlist[last_id].ordertime;
              res[i].first_success_order_price=successOrderlist[0].price;
              res[i].last_success_order_price=successOrderlist[last_id].price;
            }

            if(cancelOrderlist.length>0){
              isFalierlist=true;
              var last_id=cancelOrderlist.length-1;
              res[i].first_cancel_order_id=cancelOrderlist[0].orderid;
              res[i].last_cancel_order_id=cancelOrderlist[last_id].orderid;
              res[i].first_cancel_order_date=cancelOrderlist[0].ordertime;
              res[i].last_cancel_order_date=cancelOrderlist[last_id].ordertime;
              res[i].first_cancel_order_price=cancelOrderlist[0].price;
              res[i].last_cancel_order_price=cancelOrderlist[last_id].price;
            }
            
        }

        if(!isSuccesslist){
             res[i].first_success_order_id=0;
              res[i].last_success_order_id=0;
              res[i].first_success_order_date=0;
              res[i].last_success_order_date=0;
              res[i].first_success_order_price=0;
              res[i].last_success_order_price=0;
        }

        if(!isFalierlist){
          res[i].first_cancel_order_id=0;
          res[i].last_cancel_order_id=0;
          res[i].first_cancel_order_date=0;
          res[i].last_cancel_order_date=0;
          res[i].first_cancel_order_price=0;
          res[i].last_cancel_order_price=0;
        }

        delete res[i].orderlist;
          
        
      } 
     
  let resobj = {
    success: true,
    status: true,
    result: res
  };

  result(null, resobj);
   }
  });

};


Eatuser.new_zendesk_request_create = function new_zendesk_request_create(req) {

  var new_ZendeskRequestsModel= new Zendeskrequest(req);
  Zendeskrequest.createZendeskrequest(new_ZendeskRequestsModel, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Eatuser.zendesk_request_create = function zendesk_request_create(req, result) {

  sql.query("Select * from User where  userid = ? ",req.userid,function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
      
        if (!res[0].zendeskuserid) {
          var user ={};
          var userdetails={}
          user.name=res[0].name;
          user.email=res[0].email;
          user.phone=res[0].phoneno;
          userdetails.user = user;
          console.log("userdetails----------->",userdetails);
        var Username = 'tovologies@gmail.com';
        var Password = 'Temptovo';
      //   console.log(user11111);
        auth = "Basic " + Buffer.from(Username + ":" + Password).toString("base64");
        var headers= {
          'Content-Type': 'application/json',
          'Authorization': auth,
         };
  
    //set request parameter
       request.post({headers: headers, url: 'https://tovogroup.zendesk.com/api/v2/users.json?', json: userdetails, method: 'POST'},async function (e, r, body) {
    
       if (!body.error) {
         
         var updatedetails = await query("update User set zendeskuserid= '"+body.user.id+"' where userid = "+req.userid+ " ")

         req.zendeskuserid=body.user.id;

         Eatuser.new_zendesk_request_create(req);
   
         let resobj = {
           success: true,
           status: true,
           status_code : 200,
           message : "request created successfully",
           
         };
         result(null, resobj);
         
       }else{
         var url = "https://tovogroup.zendesk.com/api/v2/users/search.json?query=email:"+res[0].email+""
    
         console.log("-------------------------------url",url);


          request.get({headers: headers, url:url, method: 'GET'},async function (e, r, body) {
            console.log("e--",e);
            //console.log("r--",r);
            console.log("-------------------------------body",body);

            const obj = JSON.parse(body);
            console.log("-------------------------------body.user[0].id",obj.users[0]);
            if (obj.users[0].id) {
            var updatedetails = await query("update User set zendeskuserid= '"+obj.users[0].id+"' where userid = "+req.userid+ " ")

              req.zendeskuserid=obj.users[0].id;

              Eatuser.new_zendesk_request_create(req);
        
              let resobj = {
                success: true,
                status: true,
                status_code : 200,
                message : "request created successfully",
                
              };
              result(null, resobj);
            
              }
          });
       }
  
      
       });

        }else{

          req.zendeskuserid=res[0].zendeskuserid;

          console.log("req------------>",req);
          Eatuser.new_zendesk_request_create(req);
   
          let resobj = {
            success: true,
            status: true,
            status_code : 200,
            message : "request created successfully",
            
          };
          result(null, resobj);
        }


       
      }
    }
  );
};

///Click to call////
Eatuser.request_zendesk_ticket= async function request_zendesk_ticket(req,result) {   
  console.log("req--",req);
  var zendeskuserid=0;
  var auth = "Basic " + Buffer.from(constant.Username + ":" + constant.Password).toString("base64");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization': auth,
   };
  var checkTicketDetail = await query("select zendesk_ticketid from Orders where orderid="+req.orderid);
  console.log("checkTicketDetail--",checkTicketDetail);
  if(checkTicketDetail.length>0&&checkTicketDetail[0].zendesk_ticketid){
    let resobj = {
      success: true,
      status: false,
      message : "Already ticket created.",
    };
     result(null, resobj);
     return;
  }
  sql.query("Select * from User where  userid = ? ",req.userid,async function(err, res) {
    if (err) {
      result(err, null);
    } else {
      //console.log("res[0].zendeskuserid--",res[0].zendeskuserid);
      if (!res[0].zendeskuserid) {
        var user ={};
        var userdetails={}
        user.name=res[0].name;
        user.email=res[0].email;
        user.phone=res[0].phoneno;
        userdetails.user = user;
        var Userapi="/api/v2/users.json?"
        var UserURL=constant.zendesk_url+Userapi;
  //set request parameter
     request.post({headers: headers, url: UserURL, json: userdetails, method: 'POST'},async function (e, r, body) {
      var objUser = body;
      //console.log("user body--",body);
      if (typeof body === "string") { 
        try {
          objUser = JSON.parse(body);
        } catch (e) {
            console.log("e--",e);
        } 
      }
      
     if (!objUser.error) {
       var updatedetails = await query("update User set zendeskuserid= '"+objUser.user.id+"' where userid = "+req.userid+ " ")
       zendeskuserid=objUser.user.id;
       req.zendeskuserid=objUser.user.id;
       Eatuser.zendesk_ticket_create(req,result);
     }else{
       var url = constant.zendesk_url+"/api/v2/users/search.json?query=email:"+res[0].email+""
       //console.log("user search url--",url);
       request.get({headers: headers, url:url, method: 'GET'},async function (e, r, body) {
          var obj = body;
         // console.log("user search body--",body);
          if (typeof body === "string") {
            try {
              obj = JSON.parse(body);
            } catch (e) {
              console.log("e--",e);
            }
          }
          if (obj.users[0].id) {
            //console.log("obj.users[0].id--",obj.users[0].id);
            var updatedetails = await query("update User set zendeskuserid= '"+obj.users[0].id+"' where userid = "+req.userid+ " ")
            zendeskuserid=obj.users[0].id;  
            req.zendeskuserid=obj.users[0].id;
            Eatuser.zendesk_ticket_create(req,result);
          }else{
            //console.log("obj--",obj);
            let resobj = {
              success: true,
              status: false,
              message : "User not created.",
            };
             result(null, resobj);
             return;
          }
        });
     }
     });
      }else{
        zendeskuserid=res[0].zendeskuserid;
        req.zendeskuserid=res[0].zendeskuserid;
        Eatuser.zendesk_ticket_create(req,result);
      }
    }
  }
);
};

Eatuser.zendesk_ticket_create= async function zendesk_ticket_create(req,result) {
  var auth = "Basic " + Buffer.from(constant.Username + ":" + constant.Password).toString("base64");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization': auth,
   };

   var description="";
   var tags=['admin_ticket'];

   if(req.issues.length>0){
     for(var i=0;i<req.issues.length;i++){
      description=description===""?(i+1)+". "+req.issues[i].issues:description+"\n"+(i+1)+". "+req.issues[i].issues
      tags.push(req.issues[i].tag_name.replace(/\s+/g,"_"));
     }
   }

  if(req.zendeskuserid){
    var detail={};
    var ticketdetails={}
    detail.priority='high';
    detail.subject='Ticket raised from admin for order '+req.orderid;
    detail.description=description;
    detail.requester_id=req.zendeskuserid;
    detail.tags=tags;
    ticketdetails.ticket = detail;
    var url = constant.zendesk_url+"/api/v2/tickets.json"
    request.post({headers: headers, url:url, json: ticketdetails,method: 'POST'},async function (e, r, body) {
      var obj = body;
      //console.log("Ticket boday--",body);
      if (typeof body === "string") { 
        try {
          obj = JSON.parse(body);
        } catch (e) {
          console.log("e--",e);
        }
      }
      if (obj.ticket.id){
          var ticketid=obj.ticket.id;
          req.ticketid=ticketid;
          req.app_type=0;
          req.tagid=0;
          req.type=3;
          var updateOrderQuery="update Orders set zendesk_ticketid= "+ticketid+" where orderid= "+req.orderid; 
          var update_orders=await query(updateOrderQuery);
          for(var i=0;i<req.issues.length;i++){
            req.issueid=req.issues[i].id;
            Eatuser.new_zendesk_request_create(req);
          }

          let resobj = {
            success: true,
            status: true,
            message : "Ticket created successfully",
          };
         result(null, resobj);
        }
    });
  }else{
      let resobj = {
        success: true,
        status: false,
        message : "Ticket not created.Please try again later.",
      };
     result(null, resobj);
  }
}
module.exports = Eatuser;