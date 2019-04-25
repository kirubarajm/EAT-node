'user strict';
var sql = require('../db.js');
var constant = require('../constant.js');

//Task object constructor
var Eatuser = function(eatuser){
    this.name = eatuser.name;
    this.email = eatuser.email;
    this.phoneno = eatuser.phoneno;
    this.referalcode = eatuser.referalcode;
    this.locality = eatuser.locality;
    this.password = eatuser.password;
    this.created_at = new Date();
    this.virtualkey= eatuser.virtualkey || 0;
    this.otp_status = eatuser.otp_status || '';
    this.gender = eatuser.gender || '';
};



Eatuser.createUser = function createUser(newUser, result) {   
    
    if(newUser.virtualkey==null)
    newUser.virtualkey=0;

    sql.query("Select * from User where phoneno = '"+newUser.phoneno+"' OR email= '"+newUser.email+"' " , function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{

            if(res.length == 0){

        sql.query("INSERT INTO User set ?", newUser, function (err, res) {
                
            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
              let sucobj=true;
              
              if ( newUser.virtualkey === 0) {
                var mesobj = "Eat User Created successfully";
              }else if(newUser.virtualkey === 1){
                 mesobj = "Virtual User Created successfully";
              }
             
              let resobj = {  
                success: sucobj,
                message:mesobj,
                userid: res.insertId 
                }; 
          
             result(null, resobj);
            }
            });  
             }else{

            let sucobj=true;
              let message = "Following user already Exist! Please check it mobile number / email" ;
               let resobj = {  
               success: sucobj,
               message:message
               }; 

            result(null, resobj);

}

}
});  
            





};

Eatuser.getUserById = function getUserById(userId, result) {
        sql.query("Select userid,name,email,phoneno,Locality,created_at,virtualkey from User where userid = ? ", userId, function (err, res) {             
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
               let sucobj=true;
                let resobj = {  
                success: sucobj,
                result: res
                }; 

             result(null, resobj);
          
            }
            });   
};

Eatuser.getAllUser = function getAllUser(result) {
        sql.query("Select * from User", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('User : ', res);  

                 result(null, res);
                }
            });   
};

Eatuser.updateById = function(id, user, result){
  sql.query("UPDATE User SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Eatuser.remove = function(id, result){
     sql.query("DELETE FROM User WHERE userid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};



Eatuser.getAllVirtualUser = function getAllVirtualUser(req,result) {
    var userlimit = 20;
    var page = req.page||1;
    var startlimit = (page - 1)*userlimit;
    
    var query = "select * from User";
    
    if(req.virtualkey !== 'all'){
        query = "select * from User where virtualkey = "+req.virtualkey+" "
    }
    
    if(req.virtualkey !== 'all' && req.search){
        query = query+" and (phoneno LIKE  '%"+req.search+"%' OR email LIKE  '%"+req.search+"%' or name LIKE  '%"+req.search+"% ') "
    }else if(req.search){
        query = query+" where phoneno LIKE  '%"+req.search+"%' OR email LIKE  '%"+req.search+"%' or name LIKE  '%"+req.search+"% ' "
    }
    
    var  limitquery=query+ " order by userid desc limit "+startlimit+","+userlimit+" ";
    
    sql.query(limitquery, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            var totalcount = 0;

            sql.query(query, function (err, res2) {
                 totalcount = res2.length;

                 let sucobj=true;
                 let resobj = {  
                   success: sucobj,
                   totalcount:totalcount,
                   result: res
                   
                   }; 
       
                result(null, resobj);
            });
        }
    }); 
  
};


Eatuser.virtual_eatusersearch = function virtual_eatusersearch(search,result) {
   
 console.log(search);
    sql.query("select * from User where phoneno LIKE  '%"+search+"%' OR email LIKE  '%"+search+"%' or name LIKE  '%"+search+"%  ' " , function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
      
        }
        });   
};


Eatuser.get_eat_dish_list = async function(req,result) {
    
    sql.query("Select distinct pt.productid,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img as makeit_image, pt.product_name,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cusinename,ly.localityname,  ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cusine cu on cu.cusineid=pt.cusine left join Locality ly on mu.localityid=ly.localityid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '"+req.eatuserid+"' HAVING distance!= '' ORDER BY distance", function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
                for (let i = 0; i < res.length; i++) {
                    
                    eta = 15 + (3 * res[i].distance) ;
                    //15min Food Preparation time , 3min 1 km
                    res[i].eta =   Math.round(eta) +" mins" ;
                    
                   
                }

           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
      
        }
        });   
};




Eatuser.get_eat_makeit_list = function(req,result) {
    var cusinename = [];
    sql.query("Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.region,mk.costfortwo,mk.img as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from MakeitUser mk left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '"+req.eatuserid+"' HAVING distance!= '' ORDER BY distance", function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
                 
            for (let i = 0; i < res.length; i++) {

                var  groupquery = "select GROUP_CONCAT('[',(CONCAT('{cusinename:',cs.cusinename,'}')),']') as cusinename  from MakeitUser mk left join Cusine_makeit cm on cm.makeit_userid =mk.userid left join Cusine cs on cs.cusineid = cm.cusineid where mk.userid = '"+res[i].makeituserid+"'"
                  
                sql.query(groupquery, async function (err, res1) {

                    if(err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                 
               res[i].cusinename = await res1 ;
                });  
                
                console.log(cusinename);
                res[i].distance = res[i].distance.toFixed(2);
                    //15min Food Preparation time , 3min 1 km
                    eta = 15 + (3 * res[i].distance) ;
                    
                    res[i].eta =   Math.round(eta) +" mins" ;
            }

           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
      
        }
        });   
};


Eatuser.get_eat_makeit_product_list = function(req,result) {
    console.log(req);

   // sql.query("Select MakeitUser.*,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from MakeitUser  HAVING distance!= '' ORDER BY distance", function (err, res) {
   if (req.eatuserid) {
    var query = "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.region,mk.costfortwo,mk.img as makeitimg,mk.img as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('12.9760') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('80.2212') ) + sin( radians('12.9760') ) * sin(radians(lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(fa.favid,1,0),'favid',fa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid join Cuisine cu on cu.cuisineid=pt.cusine left join Fav fa on fa.makeit_userid = mk.userid or pt.productid = fa.productid and fa.eatuserid = '"+req.eatuserid+"' where mk.userid ="+req.makeit_userid+" and pt.active_status = 1";
   
   } else{
    var query = "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.region,mk.costfortwo,mk.img as makeitimg,mk.img as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('12.9760') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('80.2212') ) + sin( radians('12.9760') ) * sin(radians(lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype,'cuisinename',cu.cuisinename,'isfav',IF(fa.favid,1,0),'favid',fa.favid)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid join Cuisine cu on cu.cuisineid=pt.cusine left join Fav fa on fa.makeit_userid = mk.userid or pt.productid = fa.productid where mk.userid ="+req.makeit_userid+" and pt.active_status = 1";
   
   }
   console.log(query);
        sql.query(query, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{

            console.log(res[0].productlist );
            if (res[0].makeituserid !== null && res[0].productlist !== null)  {
                
            for (let i = 0; i < res.length; i++) {
                   
                if (res[i].productlist) {
                 res[i].productlist = JSON.parse(res[i].productlist)

                 res[i].distance = res[i].distance.toFixed(2);
                    //15min Food Preparation time , 3min 1 km
                    eta = 15 + (3 * res[i].distance) ;
                    
                    res[i].eta =   Math.round(eta) +" mins" ;

                }  
               
             }
           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
        }else{

            let sucobj=true;
            let message = "There is no product available!"
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



Eatuser.get_eat_dish_list_sort = function(req,result) {
    
    var filterquery = '';
    var cuisinequery = '';

    const filterlist = req.regionlist;
    const cuisine = req.cuisinelist;

    if (filterlist) {
        
            for (let i = 0; i < filterlist.length; i++) {
                
                  filterquery = filterquery + " mu.region like '%"+filterlist[i].region+"%' or";
            }
    }


    if (cuisine) {

        for (let i = 0; i < cuisine.length; i++) {
                
            cuisinequery = cuisinequery + " pt.cusine like '%"+cuisine[i].cuisine+"%' or";
      }
    }
    
    
    filterquery = cuisinequery + filterquery.slice(0, -2)
    //cusinequery = cusinequery.slice(0,-2)
    console.log(filterquery);
    // var query = "Select mu.userid as makeit_userid,mu.name as makeit_username,mu.img as makeit_image, pt.product_name, pt.productid,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,  ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid left join Fav fa on fa.productid = pt.productid and fa.eatuserid = '"+req.eatuserid+"'";

    if (req.eatuserid) {
        var query = "Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img as makeit_image, pt.product_name,pt.vegtype,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,ly.localityname,  ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cuisine cu on cu.cuisineid=pt.cusine left join Locality ly on mu.localityid=ly.localityid left join Fav fa on fa.productid = pt.productid and pt.active_status = 1 and pt.quantity != 0 and fa.eatuserid = '"+req.eatuserid+"'";
    }else{
         query = "Select distinct pt.productid,pt.active_status,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img as makeit_image, pt.product_name,pt.vegtype,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,ly.localityname,  ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid join Cuisine cu on cu.cuisineid=pt.cusine left join Locality ly on mu.localityid=ly.localityid left join Fav fa on fa.productid = pt.productid and pt.active_status = 1 and pt.quantity != 0";
    }
   
        if (req.search && req.filterlist != 0) {
            query = query +" where  pt.active_status = 1 and pt.product_name like '%"+req.search+"%' and" +filterquery;
        }else if(filterlist && !req.search){
            query = query +"where  pt.active_status = 1 and"+ filterquery ;
            
        }else if(req.search && !req.filterlist){
            query = query +" where pt.active_status = 1 and pt.product_name like '%"+req.search+"%'";
        }




        if (req.price == 'low to high') {
           var query = query + " ORDER BY pt.price ASC";
        } else if (req.price == 'high to low') {
             query = query + "  ORDER BY pt.price DESC";
        }else{
             query = query +" ORDER BY distance";
        }
        

    console.log(query);
    sql.query(query, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
                for (let i = 0; i < res.length; i++) {
                    
                    eta = 15 + (3 * res[i].distance) ;
                    //15min Food Preparation time , 3min 1 km
                    res[i].eta =   Math.round(eta) +" mins" ;  
                }

           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
      
        }
        });   
};




Eatuser.get_eat_kitchen_list_sort = function(req,result) {
    
    req.eatuserid =  req.eatuserid || 0;
    var filterquery = '';
    var cuisinequery = '';
    const regionlist = req.region;
    const cuisinelist = req.cuisine;
    if (regionlist) {
        
            for (let i = 0; i < regionlist.length; i++) {
                
                  filterquery = filterquery + " mk.region like '%"+regionlist[i].regionid+"%' or";
            }
    }

    if (cuisinelist) {
        
        for (let i = 0; i < cuisinelist.length; i++) {
            
              cuisinequery = cuisinequery + " cm.cusineid like '%"+cuisinelist[i].cuisineid+"%' or";
        }
}

    if (regionlist && !cuisinelist) {
        filterquery =   filterquery.slice(0, -2);
    }else if(!regionlist && cuisinelist)  {
        filterquery =  cusinequery.slice(0, -2);
    }else if(regionlist && cusinelist)  {
        filterquery = filterquery.slice(0, -2)+"or"+ cuisinequery.slice(0, -2);
    }

   

   // console.log(filterquery);
    
    if (req.eatuserid) {
        var query = "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.region,mk.costfortwo,mk.img as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid  left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid = '"+req.eatuserid+"' left outer join Cuisine_makeit cm on cm.makeit_userid = mk.userid left outer join Cuisine cu on cu.cuisineid=cm.cuisineid ";
    }else{
         query = "Select distinct mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.rating rating,mk.region,mk.costfortwo,mk.img as makeitimg,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from MakeitUser mk join Product pt on mk.userid = pt.makeit_userid left outer join Cuisine_makeit cm on cm.makeit_userid = mk.userid left outer join Cuisine cu on cu.cuisineid=cm.cuisineid  ";
    }


   
        if (req.search && req.region) {
            query = query +" where pt.quantity != 0 and mk.name like '%"+req.search+"%' or" +filterquery;
        }else if(req.region && !req.search){
            query = query +"where "+ filterquery;
            
        }else if(req.search && !req.region){
            query = query +" where  pt.quantity != 0 and mk.name like '%"+req.search+"%'";
        }




        if (req.price == 'low to high') {
           var query = query + " ORDER BY  mk.costfortwo ASC";
        } else if (req.price == 'high to low') {
             query = query + "  ORDER BY  mk.costfortwo DESC";
        }else{
             query = query +" ORDER BY distance";
        }
        

    console.log(query);
    sql.query(query, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
                for (let i = 0; i < res.length; i++) {
                    
                    eta = 15 + (3 * res[i].distance) ;
                    //15min Food Preparation time , 3min 1 km
                    res[i].eta =   Math.round(eta) +" mins" ;  
                }

           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
      
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
               
            res[0].applink = applink;
           // console.log("TEST: ",  referralcode);
              
              let sucobj=true;
               let resobj = {  
               success: sucobj,
               result: res
               }; 
   
            result(null, resobj);
         
           }
           });   
   };


 Eatuser.eatuser_login = function eatuser_login(newUser, result) { 
     
    var otp = 0;
    var passwordstatus = false;
    var otpstatus  = false;
    var genderstatus = false;

    sql.query("Select * from User where phoneno = '"+newUser.phoneno+"'" , function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            
            if(res.length == 0){

        sql.query("insert into Otp(phone_number,apptype,otp)values('"+newUser.phoneno+"',4,12345)", function (err, res) {
                
            if(err) {
                console.log("error: ", err);
                result(null, err);
            }
            else{
              let sucobj=true;
            console.log( res.insertId);          
              let resobj = {  
                success: sucobj,
                passwordstatus:passwordstatus,
                otpstatus:otpstatus,
                genderstatus:genderstatus,
                oid: res.insertId
                }; 
          
             result(null, resobj);
            }
    });  
}else{
                
                console.log(res[0]);
              
              if (res[0].password !== '' && res[0].password !== null) { 
                passwordstatus = true;
                otpstatus = true;
                genderstatus = true;
                 
              }
              
              if (res[0].gender !== '' && res[0].gender !== null && res[0].name !== '' && res[0].name !== null){
                genderstatus = true;
                otpstatus = true;
                
              }else {
                
              }

            let sucobj=true;
               let resobj = {  
               success: sucobj,
               status:true,
               passwordstatus:passwordstatus,
               otpstatus:otpstatus,
               genderstatus:genderstatus,
        
               }; 

            result(null, resobj);

}

}
});  
    
};




Eatuser.eatuser_otpverification = function eatuser_otpverification(req, result) { 
   
    var otp = 0;
    var passwordstatus = false;
    var otpstatus = false;
    var genderstatus = false;

    sql.query("Select * from Otp where oid = '"+req.oid+"'" , function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            
            if(res[0].otp == req.otp){
               

            sql.query("Select * from User where phoneno = '"+req.phoneno+"'" , function (err, res1) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
        
                    if(res1.length == 0){
          
                        var new_user = new Eatuser(req);
                        new_user.otp_status = 1;


                    sql.query("INSERT INTO User set ?", new_user, function (err, res2) {
                        
                     if(err) {
                        console.log("error: ", err);
                        result(null, err);
                    }
                    else{
                     
                     
                      let resobj = {  
                        success: true,
                        message:mesobj,
                        passwordstatus:passwordstatus,
                        otpstatus:otpstatus,
                        genderstatus:genderstatus,
                        userid: res2.insertId 
                        }; 
                  
                     result(null, resobj);
                    }
                    });  
                     }else{
        
                   
                      //let message = "Following user already Exist!, Please check it Phone number" ;
                      if (res1[0].password !== '' && res1[0].password !== null) { 
                        passwordstatus = true;
                        otpstatus = true;
                        genderstatus = true;
                         
                      }
                      
                      if (res1[0].gender !== '' && res1[0].gender !== null && res1[0].name !== '' && res1[0].name !== null){
                        genderstatus = true;
                        otpstatus = true;
                        
                      }else {
                        
                      }
        
                    
                       let resobj = {  
                       success: true,
                       status:true,
                       passwordstatus:passwordstatus,
                       otpstatus:otpstatus,
                       genderstatus:genderstatus,
                       userid:res1[0].userid
                
                       }; 
        
                    result(null, resobj);
        
        }
        
        }
        });  
}else{
                
                console.log(res[0]);
              let message = "OTP is not valid!, Try once again";
              let sucobj=true;
               let resobj = {  
               success: sucobj,
               message:message
               }; 

            result(null, resobj);

}

}
});     
};




Eatuser.edit_eat_users = function (req, result) {

        var staticquery = "UPDATE User SET updated_at = ?, ";
        var column = '';
        for (const [key, value] of Object.entries(req)) {
            console.log(`${key} ${value}`);

            if (key !== 'userid') {
                // var value = `=${value}`;
                column = column + key + "='" + value + "',";
            }


        }

       var  query = staticquery + column.slice(0, -1) + " where userid = " + req.userid;
        console.log(query);
        sql.query(query,[new Date()], function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {

                let sucobj = true;
                let message = "Updated successfully"
                let resobj = {
                    success: sucobj,
                    message: message
                };

                result(null, resobj);
            }

        });
    
};
module.exports= Eatuser;