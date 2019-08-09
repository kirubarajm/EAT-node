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
// var instance = new Razorpay({
//     key_id: 'rzp_test_3cduMl5T89iR9G',
//     key_secret: 'BSdpKV1M07sH9cucL5uzVnol'
//   })

var instance = new Razorpay({
  key_id: 'rzp_live_BLJVf00DRLWexs',
  key_secret: 'WLqR1JqCdQwnmYs6FI9nzLdD'
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
  this.pushid_ios = eatuser.pushid_android;
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
    "Select us.userid,us.name,us.email,us.phoneno,us.Locality,us.created_at,us.virtualkey,us.gender,re.regionname,us.regionid from User us join Region re on re.regionid = us.regionid  where us.userid = ? ",
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
      "%' or name LIKE  '%" +
      req.search +
      "% ') ";
  } else if (req.search) {
    query =
      query +
      " where phoneno LIKE  '%" +
      req.search +
      "%' OR email LIKE  '%" +
      req.search +
      "%' or name LIKE  '%" +
      req.search +
      "% ' ";
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
      "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,mk.locality as localityname ,re.regionname,mk.costfortwo,mk.virutal_rating_count as rating_count,mk.img1 as makeitimg,mk.about,mk.member_type,mk.locality,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid', pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
      req.eatuserid +
      "'  where mk.userid = " +
      req.makeit_userid +
      " and mk.ka_status = 2 and pt.approved_status=2 and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1 ";
  } else {
    var productquery =
      "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,ly.localityname ,re.regionname,mk.costfortwo,mk.img1 as makeitimg,mk.img2,mk.img3,mk.img4,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
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

  console.log(currenthour);

  
   if (currenthour < 12) {
    productquery = productquery + " and pt.breakfast = 1";
   }else if(currenthour >= 12 && currenthour <= 16){

      productquery = productquery + " and pt.lunch = 1";

    }else if( currenthour >= 16){

      productquery = productquery + " and pt.dinner = 1";
   }



  if (req.vegtype === "1") {
    productquery = productquery + " and pt.vegtype= 0";
  }

    console.log(productquery);
  
  sql.query(productquery, async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
     
        // if(res[0].makeitimg) Images.push(res[0].makeitimg);
        // if(res[0].img2) Images.push(res[0].img2);
        // if(res[0].img3) Images.push(res[0].img3);
        // if(res[0].img4) Images.push(res[0].img4);
        // if(Images.length!==0) res[0].images=Images;

      if (res[0].makeituserid !== null && res[0].productlist !== null) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].productlist) {
            res[i].productlist = JSON.parse(res[i].productlist);

            res[i].distance = res[i].distance.toFixed(2);
            //15min Food Preparation time , 3min 1 km
          //  eta = 15 + 3 * res[i].distance;
            var eta = foodpreparationtime + onekm * res[i].distance;

           
            res[i].eta = Math.round(eta) + " mins";
          }
        }

        const specialitems = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 3 limit 4");
        const kitcheninfoimage = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 2 limit 4");
        const kitchenmenuimage = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 4 limit 4");
        const kitchensignature = await query("select img_url,type from Makeit_images where makeitid="+req.makeit_userid+" and type = 1 limit 1");
        
        const foodbadge  = await query("select mbm.id,mb.url as badges from Makeit_badges_mapping mbm join  Makeit_badges mb on mbm.id = mb.id where mbm.makeit_id="+req.makeit_userid+"");
       // var special = await query("select * from Makeit_images ");
        res[0].specialitems=specialitems;
        res[0].kitcheninfoimage=kitcheninfoimage;
        res[0].kitchenmenuimage=kitchenmenuimage;
        res[0].kitchensignature =null
        if (kitchensignature.length !== 0) {
          res[0].kitchensignature=kitchensignature[0].img_url ;
        }
       
        res[0].foodbadge=foodbadge

   // let sucobj = true;
        let resobj = {
          success: true,
          status:true,
          result: res
        };

        result(null, resobj);
      } else {
       
        let message = "There is no product available!";
        let resobj = {
          success: true,
          status:false,
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
    console.log(filterquery);
  } else if (regionlist !== undefined && cuisinelist == undefined) {
    filterquery = "(" + filterquery.slice(0, -2) + ")";
  } else if (regionlist == undefined && cuisinelist !== undefined) {
    filterquery = cuisinequery.slice(0, -2) + ")";
  }

  //cusinequery = cusinequery.slice(0,-2)
  console.log(filterquery);
  console.log(cuisinelist);
  console.log(regionlist);
  console.log(req.search);
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

  console.log(query);
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

  console.log(query);
 
  
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
      //  eta = 15 + 3 * res[i].distance;
      var eta = foodpreparationtime + onekm * res[i].distance;
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

Eatuser.get_eat_kitchen_list_sort_filter = function(req, result) {
  
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
        filterquery + " mk.regionid = '" + regionlist[i].region + "' or";
    }
  }

  if (cuisinelist) {
    for (let i = 0; i < cuisinelist.length; i++) {
      cuisinequery =
        cuisinequery + " cm.cuisineid = '" + cuisinelist[i].cuisine + "' or";
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
    console.log(filterquery);
  } else if (regionlist !== undefined && cuisinelist == undefined) {
    filterquery = "(" + filterquery.slice(0, -2) + ")";
  } else if (regionlist == undefined && cuisinelist !== undefined) {
    filterquery = cuisinequery.slice(0, -2) + ")";
  }

  console.log(filterquery);

  if (req.eatuserid) {
    var query =
      "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
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
      "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Cuisine_makeit cm on cm.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid ";
  }

  if (
    req.search !== undefined &&
    regionlist === undefined &&
    cuisinelist === undefined
  ) {
    console.log("search");
    query =
      query +
      " where (mk.appointment_status = 3 and mk.ka_status = 2  and mk.verified_status = 1) and (pt.delete_status !=1 and pt.active_status = 1 and pt.approved_status=2 pt.quantity != 0 ) mk.name like '%" +
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
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and " +
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
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (" +
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
        " where (mk.appointment_status = 3 and  mk.ka_status = 2 and pt.approved_status=2 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (mk.name like '%" +
        req.search +
        "%') and" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (mk.name like '%" +
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
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (mk.name like '%" +
        req.search +
        "%' and" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (mk.name like '%" +
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
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (mk.name like '%" +
        req.search +
        "%' and" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (mk.name like '%" +
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
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (" +
        filterquery;
    }
  } else if (
    req.search == undefined &&
    regionlist === undefined &&
    cuisinelist === undefined
  ) {
    console.log("no filters and search");
    query =
      query +
      " where (mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status=2 and  mk.verified_status = 1)  and (pt.quantity != 0 and pt.delete_status !=1 and pt.active_status = 1) ";
  }

  if (req.vegtype) {
    query = query + "and mk.food_type= 0";
  }


  
  var day = new Date();
  var currenthour = day.getHours();

  console.log(currenthour);

  if (currenthour <= 12) {

    query = query + " and pt.breakfast = 1";
  //  console.log("breakfast");
  }else if(currenthour >= 12 && currenthour <= 16){

    query = query + " and pt.lunch = 1";
  //  console.log("lunch");
  }else if( currenthour >= 16 && currenthour <= 23){
    
    query = query + " and pt.dinner = 1";
  //  console.log("dinner");
  }


  if (req.sortid == 1) {
    query = query + " GROUP BY pt.productid HAVING distance <="+radiuslimit+" ORDER BY distance";
  } else if (req.sortid == 2) {
    query = query + " GROUP BY pt.productid HAVING distance <="+radiuslimit+" ORDER BY mk.rating DESC";
  } else if (req.sortid == 3) {
    query = query + " GROUP BY pt.productid HAVING distance <="+radiuslimit+" ORDER BY mk.costfortwo ASC";
  } else if (req.sortid == 4) {
    query = query + " GROUP BY pt.productid HAVING distance <="+radiuslimit+" ORDER BY mk.costfortwo DESC";
  } else {
    query = query + " GROUP BY pt.productid HAVING distance <="+radiuslimit+" ORDER BY distance";
  }

  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
        var eta = foodpreparationtime + onekm * res[i].distance;
        //15min Food Preparation time , 3min 1 km


        res[i].eta = Math.round(eta) + " mins";

        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }
      }

      let sucobj = true;
      let resobj = {
        success: sucobj,
        status:true,
        result: res
      };

      result(null, resobj);
    }

    // function timeConvert(n) {
    //   console.log("minitues calculate");
    //   var num = n;
    //   var hours = num / 60;
    //   var rhours = Math.floor(hours);
    //   var minutes = (hours - rhours) * 60;
    //   var rminutes = Math.round(minutes);
    //   return (
    //     eta +
    //     " minutes = " +
    //     rhours +
    //     " hour(s) and " +
    //     rminutes +
    //     " minute(s)."
    //   );
    // }
  });
};

Eatuser.eat_user_referral_code = function eat_user_referral_code(req,result) {
   
    var applink = constant.applink;
    var refferalcontent = constant.refferalcontent;

       sql.query("select referalcode from User where userid = '"+req.userid+"' " , function (err, res) {
   
           if(err) {
               console.log("error: ", err);
               result(err, null);
           }
           else{
              
          //  res[0].applink = "https://play.google.com/store/apps/details?id=com.tovo.eat&referrer=utm_source%3Dreferral%26utm_medium%3D"+res[0].referalcode+"%26utm_campaign%3Dreferral";
        //  console.log("res[0].referalcode: ", res[0].referalcode);
          res[0].applink = refferalcontent+" "+ applink +". Use Refferal Code :"+ res[0].referalcode
              
          
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


Eatuser.eatuser_login = function eatuser_login(newUser, result) { 
     
  var OTP = Math.floor(Math.random() * 90000) + 10000;
   
  var passwordstatus = false;
  var otpstatus = false;
  var genderstatus = false;
  var otptemp = 0;
  var otpurl =
    "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
    newUser.phoneno +
    "&senderId=EATHOM&message=Your EAT App OTP is " +
    OTP +
    ". Note: Please DO NOT SHARE this OTP with anyone.";

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

                if (responcecode[0] === "0") {
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
                          message: responcecode[1],
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
                    message: responcecode[1],
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
          console.log(res);
             //eat login password validate condition commanded 04-07-2019
          // if (res[0].password !== "" && res[0].password !== null) {
          //   passwordstatus = true;
          //   otpstatus = true;
          //   genderstatus = true;
          // }

          if (
            res[0].gender !== "" &&
            res[0].gender !== null &&
            res[0].name !== "" &&
            res[0].name !== null
          ) {
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
                  console.log(responcecode[0]);

                  if (responcecode[0] === "0") {
                    sql.query("insert into Otp(phone_number,apptype,otp)values('" +newUser.phoneno +"',4,'" +OTP +"')",function(err, res1) {
                        if (err) {
                          console.log("error: ", err);
                          result(null, err);
                        } else {
                          let resobj = {
                            success: true,
                            status: true,
                            message: responcecode[1],
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
                      message: responcecode[1],
                      passwordstatus: passwordstatus,
                      otpstatus: otpstatus,
                      genderstatus: genderstatus,
                      userid: res[0].userid,
                      oid: res1.insertId
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



Eatuser.eatuser_otpverification = function eatuser_otpverification(req,result) {
  var otp = 0;
  var passwordstatus = false;
  var emailstatus = false;
  var otpstatus = false;
  var genderstatus = false;

  sql.query("Select * from Otp where oid = " +req.oid+ "", function(err,res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {

      console.log(res);
      console.log(req.otp);

      if (res[0].otp == req.otp) {
        console.log("OTP VALID");
        sql.query("Select * from User where phoneno = '" + req.phoneno + "'",function(err, res1) {
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
                      result: []
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
};

Eatuser.edit_eat_users = function(req, result) {

  var staticquery = "UPDATE User SET updated_at = ?, ";
  var column = "";
  req.referalcode = "EATWELL" + req.userid;
  for (const [key, value] of Object.entries(req)) {
    console.log(`${key} ${value}`);

    if (key !== "userid") {
      // var value = `=${value}`;
      column = column + key + "='" + value + "',";
    }
  }

  var query =
    staticquery + column.slice(0, -1) + " where userid = " + req.userid;
  console.log(query);
  sql.query(query, [new Date()], function(err, res) {
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

 // console.log(userinfo[0].razer_customerid);
  var customerid = userinfo[0].razer_customerid;

  req.name= userinfo[0].name;
  req.phoneno= userinfo[0].phoneno;
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

  console.log(regionquery);
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

   
  const userinfo = await query("select regionid from User where userid= "+req.eatuserid+"");

  if (userinfo.length !==0) {
    
  if (req.regionid < 1 || req.regionid ===undefined) {
      var getregionquery = "select lat,lon,regionid from Region where regionid = (select regionid from User where userid= "+req.eatuserid+")";
    }else{
      var getregionquery = "select lat,lon,regionid from Region where regionid = "+req.regionid+"";
    }
    //var getregionquery = "select lat,lon,regionid from  Region where regionid = (select regionid from User where userid= '"+req.eatuserid+"')";

    sql.query(getregionquery, function (err, res1) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
               
                var getregionlistquery = "select re.*,st.statename,( 3959 * acos( cos( radians('"+res1[0].lat+"') ) * cos( radians( re.lat ) )  * cos( radians( re.lon ) - radians('"+res1[0].lon+"') ) + sin( radians('"+res1[0].lat+"') ) * sin(radians(re.lat)) ) ) AS distance from Region re left join State st on re.stateid=st.stateid  group by re.regionid  order by distance ASC";

                sql.query(getregionlistquery, async function (err, res2) {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else {
                     
                        var temparray = [];
                      //  res2.forEach(function(v){ delete v.distance});
                        let limit = 3;
                        for (let i = 0; i < res2.length; i++) {

                     
                       var nearbyregionquery = "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,mk.member_type,mk.about,fa.favid,IF(fa.favid,'1','0') as isfav, ( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = "+req.eatuserid+"  left join Cuisine_makeit cm on cm.makeit_userid = mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid  where mk.regionid ="+res2[i].regionid+"  and  mk.appointment_status = 3 and mk.verified_status = 1  and mk.ka_status = 2 and pt.approved_status=2 and  pt.quantity != 0 and pt.delete_status !=1  GROUP BY pt.productid   HAVING distance <="+radiuslimit+" ORDER BY distance";
                      //  console.log(nearbyregionquery);
                          let kitchenlist = await query(nearbyregionquery);
                          var kitchendetaillist=[];
                          //this code is important
                         // var kitchencount = kitchenlist.length>limit?limit:kitchenlist.length;
                         var kitchencount = kitchenlist.length
                          res2[i].kitchencount = kitchenlist.length;
                         // console.log('kloop'+kitchencount);
                            
                            if (kitchenlist.length  !==0) {

                                for (let j = 0; j < kitchencount; j++) {
                                  //  console.log('loop'+kitchencount);
                                  //  var eta = 15 + (3 * kitchenlist[j].distance) ;\
                                  var eta = foodpreparationtime + (onekm  * kitchenlist[j].distance);
                                    //15min Food Preparation time , 3min 1 km
                                    
                                    kitchenlist[j].eta =   Math.round(eta) +" mins" ;
                                    if (kitchenlist[j].cuisines) {
                                        kitchenlist[j].cuisines = JSON.parse(kitchenlist[j].cuisines)
                                       }
                                       kitchendetaillist.push(kitchenlist[j]);
                                    
                                }

                                res2[i].kitchenlist=kitchendetaillist;

                                temparray.push(res2[i]);
                            }
                            
                        }

                
                           
                            let resobj = {
                                success: true,
                                status:true,
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
      message:"Sorry following user not found!"
  };

  result(null, resobj);
}
};





Eatuser.get_eat_region_kitchen_list_show_more =  function get_eat_region_kitchen_list_show_more (req,result) {
    
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;


    var nearbyregionquery = "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav, ( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = "+req.eatuserid+"  left join Cuisine_makeit cm on cm.makeit_userid = mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid  where mk.regionid ="+req.regionid+"  and  mk.appointment_status = 3 and mk.ka_status = 2 and pt.approved_status = 2 and mk.verified_status = 1  and pt.quantity != 0 and pt.delete_status !=1  GROUP BY pt.productid   HAVING distance <="+radiuslimit+" ORDER BY distance";

      
       sql.query(nearbyregionquery, function (err, res) {

         if(err) {
             console.log("error: ", err);
             result(err, null);
         }
         else{

             for (let i = 0; i < res.length; i++) {
 
               //  var eta = 15 + (3 * res[i].distance) ;
                 var eta = foodpreparationtime + onekm * res[i].distance;
                  //15min Food Preparation time , 3min 1 km 
                
                  res[i].eta =   Math.round(eta) +" mins" ;  
             

              if (res[i].cuisines) {
                  res[i].cuisines = JSON.parse(res[i].cuisines)
                 }


              }


         let sucobj = true;
         let resobj = {
             success: sucobj,
             status:true,
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
        console.log(data);
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


    Eatuser.eat_explore_kitchen_dish = function eat_explore_kitchen_dish(req,result) {

      var foodpreparationtime = constant.foodpreparationtime;
      var onekm = constant.onekm;
      var radiuslimit=constant.radiuslimit;
        if (req.eatuserid) {
          var query =
            "Select pt.makeit_userid  as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,ly.localityname ,re.regionname,mk.costfortwo,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
            req.lat +
            "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
            req.lon +
            "') ) + sin( radians('" +
            req.lat +
            "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('makeit_userid',pt.makeit_userid,'quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
            req.eatuserid +
            "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
            req.eatuserid +
            "'  where product_name like '%" +
            req.search +
            "%' and pt.active_status = 1 and mk.ka_status = 2 and pt.approved_status=2 and pt.quantity != 0 and pt.delete_status != 1  group by pt.makeit_userid";

          //var query ="Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid as makeit_region,re.regionname, pt.product_name,pt.vegtype,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,cu.cuisineid,ly.localityname, ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cuisine cu on cu.cuisineid=pt.cuisine left join Locality ly on mu.localityid=ly.localityid join Region re on re.regionid = mu.regionid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '"+req.eatuserid+"'  where mu.appointment_status = 3 and mu.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1 and pt.product_name like '%"+req.search+"%'  HAVING distance <="+radiuslimit+" ORDER BY pt.product_name ASC";
        } 


        console.log(query);

      sql.query(query, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {

          for (let i = 0; i < res.length; i++) {
            
              res[i].productlist =JSON.parse(res[i].productlist)
              res[i].distance = res[i].distance.toFixed(2);
              //15min Food Preparation time , 3min 1 km
            //  eta = 15 + 3 * res[i].distance;
            var eta = foodpreparationtime + onekm * res[i].distance;
  
              // if (eta > 60) {
              //   eta = 60;
              // }
              res[i].eta = Math.round(eta) + " mins";
            
          }


          let resobj = {
              success: true,
              status:true,
              result:res
          };
    
          result(null, resobj);

        }
      });
    };




    Eatuser.eat_app_version_check_vid= async function eat_app_version_check_vid(req,result) { 
 
      var updatestatus = {};
      var versionstatus = false;
      var eatforceupdatestatus =false;

      var eatversioncode = constant.eatversioncode;
      var eatforceupdate = constant.eatforceupdate;
      

      if (req.eatversioncode < eatversioncode) {
        
        versionstatus = true;
        eatforceupdatestatus = true;
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

 
module.exports = Eatuser;
