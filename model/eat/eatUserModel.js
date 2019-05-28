'user strict';
var sql = require('../db.js');
var constant = require('../constant.js');
var request = require('request');
const util = require('util');
//const Razorpay = require("razorpay");
// var instance = new Razorpay({
//     key_id: 'rzp_test_3cduMl5T89iR9G',
//     key_secret: 'BSdpKV1M07sH9cucL5uzVnol'
//   })


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
  this.gender = eatuser.gender || "";
  this.regionid = eatuser.regionid;
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
    "Select userid,name,email,phoneno,Locality,created_at,virtualkey from User where userid = ? ",
    userId,
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

Eatuser.get_eat_makeit_product_list = function(req, result) {
  console.log(req);
  if(!req.lat&&!req.lon){
  req.lat='12.9760';
  req.lon='80.2212';
  }

  // sql.query("Select MakeitUser.*,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from MakeitUser  HAVING distance!= '' ORDER BY distance", function (err, res) {
  //    if (req.eatuserid) {
  //     var query = "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.region,mk.costfortwo,mk.img as makeitimg,mk.img as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('12.9760') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('80.2212') ) + sin( radians('12.9760') ) * sin(radians(lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,cu.cuisineid,'isfav',IF(fa.favid,1,0),'favid',fa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid join Cuisine cu on cu.cuisineid=pt.cusine left join Fav fa on fa.makeit_userid = mk.userid or pt.productid = fa.productid and fa.eatuserid = '"+req.eatuserid+"' where mk.userid ="+req.makeit_userid+" and pt.active_status = 1";

  //    } else{
  //     var query = "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.region,mk.costfortwo,mk.img as makeitimg,mk.img as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('12.9760') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('80.2212') ) + sin( radians('12.9760') ) * sin(radians(lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,cu.cuisineid,'isfav',IF(fa.favid,1,0),'favid',fa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid join Cuisine cu on cu.cuisineid=pt.cusine left join Fav fa on fa.makeit_userid = mk.userid or pt.productid = fa.productid where mk.userid ="+req.makeit_userid+" and pt.active_status = 1";

  //    }

  if (req.eatuserid) {
    var query =
      "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,ly.localityname ,re.regionname,mk.costfortwo,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
      req.eatuserid +
      "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
      req.eatuserid +
      "'  where mk.userid = " +
      req.makeit_userid +
      " and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1 ";
  } else {
    var query =
      "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,ly.localityname ,re.regionname,mk.costfortwo,mk.img1as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  join Fav fa on fa.makeit_userid = mk.userid  join Fav faa on faa.productid = pt.productid  where mk.userid =" +
      req.makeit_userid +
      " and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1";
  }
  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      console.log(res[0].productlist);
      if (res[0].makeituserid !== null && res[0].productlist !== null) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].productlist) {
            res[i].productlist = JSON.parse(res[i].productlist);

            res[i].distance = res[i].distance.toFixed(2);
            //15min Food Preparation time , 3min 1 km
            eta = 15 + 3 * res[i].distance;

            if (eta > 60) {
              eta = 60;
            }
            res[i].eta = Math.round(eta) + " mins";
          }
        }
        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };

        result(null, resobj);
      } else {
        let sucobj = true;
        let message = "There is no product available!";
        let resobj = {
          success: sucobj,
          message: message
        };

        result(null, resobj);
      }
    }
    // }
  });
};

Eatuser.get_eat_dish_list_sort_filter = function(req, result) {
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
      " where mu.appointment_status = 3 and mu.verified_status = 1 and pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 and pt.product_name like '%" +
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
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and " +
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
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (" +
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
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (pt.product_name like '%" +
        req.search +
        "%') and" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (pt.product_name like '%" +
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
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (pt.product_name like '%" +
        req.search +
        "%' and" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (pt.product_name like '%" +
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
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (pt.product_name like '%" +
        req.search +
        "%' and" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (pt.product_name like '%" +
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
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (" +
        filterquery;
    } else {
      query =
        query +
        " where (mu.appointment_status = 3 and mu.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (" +
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
      " where mu.appointment_status = 3 and mu.verified_status = 1 and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1";
  }

  if (req.sortid == 1) {
    query = query + " ORDER BY distance";
  } else if (req.sortid == 2) {
    query = query + " ORDER BY distance";
  } else if (req.sortid == 3) {
    query = query + " ORDER BY pt.price ASC";
  } else if (req.sortid == 4) {
    query = query + " ORDER BY pt.price DESC";
  } else {
    query = query + " ORDER BY distance";
  }

  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
        eta = 15 + 3 * res[i].distance;
        //15min Food Preparation time , 3min 1 km
        if (eta > 60) {
          eta = 60;
        }
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
      " where mk.appointment_status = 3 and mk.verified_status = 1 and pt.delete_status !=1 and mk.name like '%" +
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
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and " +
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
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (" +
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
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (mk.name like '%" +
        req.search +
        "%') and" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (mk.name like '%" +
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
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (mk.name like '%" +
        req.search +
        "%' and" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 ) and (mk.name like '%" +
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
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (mk.name like '%" +
        req.search +
        "%' and" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (mk.name like '%" +
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
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 OR fa.eatuserid = '" +
        req.eatuserid +
        "') and (" +
        filterquery;
    } else {
      query =
        query +
        " where (mk.appointment_status = 3 and mk.verified_status = 1 ) and (pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1) and (" +
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
      " where mk.appointment_status = 3 and mk.verified_status = 1  and pt.quantity != 0 and pt.delete_status !=1 ";
  }

  if (req.sortid == 1) {
    query = query + " GROUP BY pt.productid ORDER BY distance";
  } else if (req.sortid == 2) {
    query = query + " GROUP BY pt.productid ORDER BY mk.rating DESC";
  } else if (req.sortid == 3) {
    query = query + " GROUP BY pt.productid ORDER BY mk.costfortwo ASC";
  } else if (req.sortid == 4) {
    query = query + " GROUP BY pt.productid ORDER BY mk.costfortwo DESC";
  } else {
    query = query + " GROUP BY pt.productid ORDER BY distance";
  }

  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
        var eta = 15 + 3 * res[i].distance;
        //15min Food Preparation time , 3min 1 km

        if (eta > 60) {
          eta = 60;
        }
        res[i].eta = Math.round(eta) + " mins";

        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }
      }

      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }

    function timeConvert(n) {
      console.log("minitues calculate");
      var num = n;
      var hours = num / 60;
      var rhours = Math.floor(hours);
      var minutes = (hours - rhours) * 60;
      var rminutes = Math.round(minutes);
      return (
        eta +
        " minutes = " +
        rhours +
        " hour(s) and " +
        rminutes +
        " minute(s)."
      );
    }
  });
};

Eatuser.eat_user_referral_code = function eat_user_referral_code(req,result) {
   
    var applink = constant.applink;

       sql.query("select referalcode from User where userid = '"+req.userid+"' " , function (err, res) {
   
           if(err) {
               console.log("error: ", err);
               result(err, null);
           }
           else{
               
            res[0].applink = "https://play.google.com/store/apps/details?id=com.tovo.eat&referrer=utm_source%3Dreferral%26utm_medium%3D"+res[0].referalcode+"%26utm_campaign%3Dreferral";

           // https://play.google.com/store/apps/details?id=com.tovo.eat&referrer=utm_source%3Dreferral%26utm_medium%3Deat001%26utm_campaign%3Dreferral
           // console.log("TEST: ",  referralcode);
              
          
               let resobj = {  
               success: true,
               result: res
               }; 
   
            result(null, resobj);
         
           }
           });   
   };


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

  sql.query(
    "Select * from User where phoneno = '" + newUser.phoneno + "'",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log(res);
        if (res.length === 0) {
          console.log("validate password");

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

          if (res[0].password !== "" && res[0].password !== null) {
            passwordstatus = true;
            otpstatus = true;
            genderstatus = true;
          }

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

Eatuser.eatuser_otpverification = function eatuser_otpverification(
  req,
  result
) {
  var otp = 0;
  var passwordstatus = false;
  var otpstatus = false;
  var genderstatus = false;

  sql.query("Select * from Otp where oid = '" + req.oid + "'", function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      if (res[0].otp == req.otp) {
        console.log("OTP VALID");
        sql.query(
          "Select * from User where phoneno = '" + req.phoneno + "'",
          function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              if (res1.length == 0) {
                var new_user = new Eatuser(req);
                new_user.otp_status = 1;

                sql.query("INSERT INTO User set ?", new_user, function(
                  err,
                  res2
                ) {
                  if (err) {
                    console.log("error: ", err);
                    result(null, err);
                  } else {
                    let resobj = {
                      success: true,
                      // message:mesobj,
                      passwordstatus: passwordstatus,
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
                if (res1[0].password !== "" && res1[0].password !== null) {
                  passwordstatus = true;
                  otpstatus = true;
                  genderstatus = true;
                }

                if (
                  res1[0].gender !== "" &&
                  res1[0].gender !== null &&
                  res1[0].name !== "" &&
                  res1[0].name !== null
                ) {
                  genderstatus = true;
                  otpstatus = true;
                }

                console.log(res1[0].userid);
                sql.query(
                  "Select * from Address where userid = '" +
                    res1[0].userid +
                    "' and address_default = 1 and delete_status=0",
                  function(err, res3) {
                    if (err) {
                      console.log("error: ", err);
                      result(err, null);
                    } else {
                      responce = [];

                      console.log(res3.length);
                      if (res3.length !== 0) {
                        responce.push(res3[0]);
                      }

                      let resobj = {
                        success: true,
                        status: true,
                        passwordstatus: passwordstatus,
                        otpstatus: otpstatus,
                        genderstatus: genderstatus,
                        userid: res1[0].userid,
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
    "Select userid,name,email,phoneno,referalcode,Locality,gender,virtualkey from User where phoneno = ? and password = ?",
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

Eatuser.eat_user_post_registration = function(req, result) {
  var staticquery = "UPDATE User SET updated_at = ?, ";
  var column = "";

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

Eatuser.create_customerid_by_razorpay = function create_customerid_by_razorpay(
  newUser,
  result
) {
  var razorpay = "https://api.razorpay.com/v1/customers";
  // var instance = new Razorpay({
  //   key_id: "rzp_test_3cduMl5T89iR9G",
  //   key_secret: "BSdpKV1M07sH9cucL5uzVnol"
  // });

  instance.customers.create({ name, email, contact, notes });
  request(
    {
      method: "POST",
      rejectUnauthorized: false,
      url: razorpay
    },
    function(error, response, body) {
      if (error) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log(response.statusCode, body);
        var responcecode = body.split("#");
      }
    }
  );
};

Eatuser.get_eat_region_makeit_list = function get_eat_region_makeit_list(
  req,
  result
) {
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
    "' and mk.appointment_status = 3 and mk.verified_status = 1 group by mk.userid HAVING distance <=6 order by distance ASC limit 3";

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
                  "' and mk.appointment_status = 3 and mk.verified_status = 1 group by mk.userid,distance HAVING distance <=6 order by distance ASC limit 3";

                let kitchenlist = await query(nearbyregionquery);

            //    console.log("loop" + kitchenlist.length);
                // sql.query(nearbyregionquery, function (err, res3) {
                //     if (err) {
                //         console.log("error: ", err);
                //         result(err, null);
                //     }
                //     else {

                //         console.log("res3-------------"+res3);
                res = [...res, ...kitchenlist];
                // res.concat(kitchenlist);
             //   console.log("res loop" + res.length);

                //     }
                // });
              }

          //    console.log("new by location" + nearbyotherregion);

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

Eatuser.get_eat_region_makeit_list_by_eatuserid =  function get_eat_region_makeit_list_by_eatuserid (req,result) {
   
 
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
               
                var getregionlistquery = "select regionid,regionname,region_image,( 3959 * acos( cos( radians('"+res1[0].lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+res1[0].lon+"') ) + sin( radians('"+res1[0].lat+"') ) * sin(radians(lat)) ) ) AS distance from Region  group by regionid  order by distance ASC";

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

                     
                       var nearbyregionquery = "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav, ( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = "+req.eatuserid+"  left join Cuisine_makeit cm on cm.makeit_userid = mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid  where mk.regionid ="+res2[i].regionid+"  and  mk.appointment_status = 3 and mk.verified_status = 1  and pt.quantity != 0 and pt.delete_status !=1  GROUP BY pt.productid HAVING distance <=6 ORDER BY distance";
                        //console.log(nearbyregionquery);
                          let kitchenlist = await query(nearbyregionquery);
                          var kitchendetaillist=[];
                          var kitchencount = kitchenlist.length>limit?limit:kitchenlist.length;
                          res2[i].kitchencount = kitchenlist.length;
                         // console.log('kloop'+kitchencount);
                            
                            if (kitchenlist.length  !==0) {

                                for (let j = 0; j < kitchencount; j++) {
                                  //  console.log('loop'+kitchencount);
                                    var eta = 15 + (3 * kitchenlist[j].distance) ;
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

                
                            let sucobj = true;
                            let resobj = {
                                success: sucobj,
                                status:true,
                                result:temparray
                            };
                
                            result(null, resobj);
                    }

                });
        }
  });
};

Eatuser.get_eat_region_kitchen_list_show_more =  function get_eat_region_kitchen_list_show_more (req,result) {
    

    var nearbyregionquery = "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,re.regionname,mk.costfortwo,mk.img1 as makeitimg,ly.localityname,fa.favid,IF(fa.favid,'1','0') as isfav, ( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left join Region re on re.regionid = mk.regionid left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = "+req.eatuserid+"  left join Cuisine_makeit cm on cm.makeit_userid = mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mk.localityid=ly.localityid  where mk.regionid ="+req.regionid+"  and  mk.appointment_status = 3 and mk.verified_status = 1  and pt.quantity != 0 and pt.delete_status !=1  GROUP BY pt.productid HAVING distance <=6 ORDER BY distance";

      
       sql.query(nearbyregionquery, function (err, res) {

         if(err) {
             console.log("error: ", err);
             result(err, null);
         }
         else{

             for (let i = 0; i < res.length; i++) {
 
                 var eta = 15 + (3 * res[i].distance) ;
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


Eatuser.create_customerid_by_razorpay = function create_customerid_by_razorpay(newUser, result) { 
 
  

    var name = "sureshtovo1";
    var email = "sureshtovo1@razorpay.com";
    var contact = "1234567892";
    var notes = "test";

   instance.customers.create({name, email, contact, notes}).then((data) => {
   
        let sucobj = true;
        let message = "customer created successfully"
        let resobj = {
            success: sucobj,
            status:true,
            message: message,
            result:data
        };
  
        result(null, resobj);
     }).catch((error) => {
      
       let sucobj = true;
       let message = "Error"
       let resobj = {
           success: sucobj,
           status:true,
           message: message,
           result:error
       };
 
       result(null, resobj);

     })
    }


    Eatuser.eat_explore_kitchen_dish_region = function eat_explore_kitchen_dish_region(req,result) {

        if (req.eatuserid) {
          // var query =
          //   "Select pt.makeit_userid  as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.regionid,ly.localityname ,re.regionname,mk.costfortwo,mk.img as makeitimg,mk.img as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('" +
          //   req.lat +
          //   "') ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians('" +
          //   req.lon +
          //   "') ) + sin( radians('" +
          //   req.lat +
          //   "') ) * sin(radians(mk.lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(faa.favid,1,0),'favid',faa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Cuisine cu on cu.cuisineid=pt.cuisine left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid  left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '" +
          //   req.eatuserid +
          //   "' left join Fav faa on faa.productid = pt.productid and faa.eatuserid = '" +
          //   req.eatuserid +
          //   "'  where product_name like '%" +
          //   req.search +
          //   "%' and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status != 1  group by pt.makeit_userid";

          var query ="Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid as makeit_region,re.regionname, pt.product_name,pt.vegtype,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,cu.cuisineid,ly.localityname, ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cuisine cu on cu.cuisineid=pt.cuisine left join Locality ly on mu.localityid=ly.localityid join Region re on re.regionid = mu.regionid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '63'  where mu.appointment_status = 3 and mu.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1 and pt.product_name like '%Dosa%' HAVING distance  <=6 ORDER BY distance ";
        } 


        console.log(query);

      sql.query(query, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {

          for (let i = 0; i < res.length; i++) {
            
              res[i].distance = res[i].distance.toFixed(2);
              //15min Food Preparation time , 3min 1 km
              eta = 15 + 3 * res[i].distance;
  
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


module.exports = Eatuser;
