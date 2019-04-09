'user strict';
var sql = require('../db.js');

//Task object constructor
var Eatuser = function(eatuser){
    this.name = eatuser.name;
    this.email = eatuser.email;
    this.phoneno = eatuser.phoneno;
    this.referalcode = eatuser.referalcode;
    this.locality = eatuser.locality;
    this.password = eatuser.password;
    this.created_at = new Date();
    this.virtualkey= eatuser.virtualkey;
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
    
    sql.query("Select mu.userid as makeit_userid,mu.name as makeit_username,mu.img as makeit_image, pt.product_name, pt.productid,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,  ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid left join Fav fa on fa.productid = pt.productid HAVING distance!= '' ORDER BY distance", function (err, res) {

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

    sql.query("Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img as makeitimg,fa.favid,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from MakeitUser mk left join Fav fa on fa.makeit_userid = mk.userid HAVING distance!= '' ORDER BY distance", function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            
            for (let i = 0; i < res.length; i++) {
                    
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

        sql.query("Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img as makeitimg,fa.favid,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance,JSON_ARRAYAGG(JSON_OBJECT('quantity', pt.quantity,'productid', pt.productid,'price',pt.price,'product_name',pt.product_name,'productid',pt.productid,'productimage',pt.image,'vegtype',pt.vegtype)) AS productlist from MakeitUser mk left join Product pt on pt.makeit_userid = mk.userid left join Fav fa on fa.makeit_userid = mk.userid where mk.userid ="+req.makeit_userid+" and active_status = 1 ", function (err, res) {


        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{


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
      
        }
        });   
};



Eatuser.get_eat_dish_list_sort = function(req,result) {
    
    var filterquery = '';

    const filterlist = req.filter;
    if (filterlist) {
        
            for (let i = 0; i < filterlist.length; i++) {
                
                  filterquery = filterquery + " mu.region like '%"+filterlist[i].region+"%' or";
            }
    }
    
    filterquery = filterquery.slice(0, -2)
    console.log(filterquery);
    var query = "Select mu.userid as makeit_userid,mu.name as makeit_username,mu.img as makeit_image, pt.product_name, pt.productid,pt.image,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,  ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( mu.lat ) )  * cos( radians( mu.lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(mu.lat)) ) ) AS distance  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid left join Fav fa on fa.productid = pt.productid ";

        if (req.search && req.filter) {
            query = query +" where pt.product_name like '%"+req.search+"%' and" +filterquery;
        }else if(filterlist && !req.search){
            query = query +"where "+ filterquery;
            
        }else if(req.search && !req.filter){
            query = query +" where pt.product_name like '%"+req.search+"%'";
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


module.exports= Eatuser;