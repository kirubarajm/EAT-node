"user strict";
var sql = require("../db.js");
const CronJob = require('cron').CronJob;
const util = require('util');
var moment = require("moment");

const query = util.promisify(sql.query).bind(sql);
var QuickSearch = function(QuickSearch){
    this.eatuserid = QuickSearch.eatuserid;
    this.productid=QuickSearch.productid || 0;
    //this.created_at = new Date();
    this.makeit_userid = QuickSearch.makeit_userid || 0;
};


QuickSearch.eat_explore_store_data_by_cron =  async function eat_explore_store_data_by_cron(search, result) {
    try {
      const quicksearchquery = await query("Select * from QuickSearch");
      if (quicksearchquery.err) {  
        let resobj = {
        success: sucobj,
        status:false,
        result: err
      };
  
      result(null, resobj);
    }else{
  
  
      if (quicksearchquery) {
  
        const truncatequery = await query("truncate QuickSearch");
        if (truncatequery.err) {  
          let resobj = {
          success: sucobj,
          status:false,
          result: err
        };
    
        result(null, resobj);
      }
      
      }
  
      const productquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct product_name as name,productid as id, 1 from Product where product_name IS NOT NULL group by product_name");
  
      if (productquery.err) {  
        let resobj = {
        success: sucobj,
        status:false,
        result: err
      };
  
      result(null, resobj);
    }else{
  
  
    //  const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1");
    const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1 group by mk.userid");
      if (kitchenquery.err) {  
        let resobj = {
        success: sucobj,
        status:false,
        result: err
      };
  
      result(null, resobj);
    }else{
  
      const regionquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct regionname as name,regionid as id, 3 from Region where regionname IS NOT NULL group by regionname");
  
      if (regionquery.err) {  
        let resobj = {
        success: sucobj,
        status:false,
        result: err
      };
  
      result(null, resobj);
    }else{
  
      let sucobj = true;
      let resobj = {
        success: sucobj,
        status:true,
        message:"Quick search updated"
      };
  
      result(null, resobj);
    }
  
  
    }
  }
  }
    
    } catch (error) {
      let sucobj = true;
              let resobj = {
                success: sucobj,
                result: res
              };
      
              result(null, resobj);
            }
    }
       
   // This cron is to running all region and product and makeit to quick search
    //console.log('Before job instantiation');
      const job = new CronJob('0 */1 * * * *',async function(search, result) {
       // console.log("quick search");
      try {
        const quicksearchquery = await query("Select * from QuickSearch");
        if (quicksearchquery.err) {  
          let resobj = {
          success: false,
          status:false,
          result: err
        };
    
        result(null, resobj);
      }else{
    
        if (quicksearchquery) {
    
          const truncatequery = await query("truncate QuickSearch");
          if (truncatequery.err) {  
            let resobj = {
            success: sucobj,
            status:false,
            result: err
          };
      
          result(null, resobj);
        }
        
        }

        var day = moment().format("YYYY-MM-DD HH:mm:ss");;
        var currenthour  = moment(day).format("HH");
        var cyclequery = "";
       
        if (currenthour < 12) {

          cyclequery = cyclequery + " and pt.breakfast = 1";
        //  console.log("breakfast");
        }else if(currenthour >= 12 && currenthour <= 16){

          cyclequery = cyclequery + " and pt.lunch = 1";
        //  console.log("lunch");
        }else if( currenthour >= 16){
          
          cyclequery = cyclequery + " and pt.dinner = 1";
        //  console.log("dinner");
        }

       var proquery = "INSERT INTO QuickSearch (name,id, type) SELECT distinct pt.product_name as name,pt.productid as id, 1 from Product pt join MakeitUser mk on mk.userid = pt.makeit_userid where (pt.product_name IS NOT NULL and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 "+cyclequery+")and(mk.appointment_status = 3 and mk.verified_status = 1)  group by pt.product_name"
        
        const productquery = await query(proquery);
    
      //  const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  brandname as name,userid as id, 2 from MakeitUser where (brandname IS NOT NULL and brandname != '') and appointment_status = 3 and verified_status = 1");
        const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 "+cyclequery+") group by mk.userid");
   
 
        const regionquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct regionname as name,regionid as id, 3 from Region where regionname IS NOT NULL group by regionname");
      
      }
    
      
      } catch (error) {
        
                let resobj = {
                  success: true,
                  status:false,
                  result: error
                };
        
                result(null, resobj);
              }
       });
   // console.log('After job instantiation');
    job.start();  
   
  
    //incomplete online and release product quantity and order release by user.
  //  const job1 = new CronJob('*/30 * * * *',async function(){
     
  //  var res = await query("select * from Orders where lock_status = 1 and payment_type = 1 and orderstatus = 0 and created_at > (NOW() - INTERVAL 10 MINUTE)");

  //    // console.log("cron for product revert online orders in-complete orders"+res);
  //           if (res.length !== 0) {
              
  //             for (let i = 0; i < res.length; i++) {
                
  //               var lockres = await query("select * from Lock_order where orderid ='"+ res[i].orderid+"' ");

  //               console.log(lockres);
  //                   if (lockres.length !== 0) {
                      
  //                         for (let j = 0; j < lockres.length; j++) {
                            
  //                           var productquantityadd = await query("update Product set quantity = quantity+" +lockres[j].quantity +" where productid =" +lockres[j].productid +"");

  //                           var updatequery = await query("update Orders set orderstatus = 8,payment_status= 3 where orderid = '"+res[i].orderid+"'");
                         
  //                         }


  //                   }
  //             }
             

  //           }

    
  //   });
  //   job1.start();

  QuickSearch.eat_explore_quick_search = function eat_explore_quick_search(req, result) {
    console.log(req.search);
   var searchquery = "select *, IF(type<3, IF(type=2, 'Kitchan', 'Product'), 'Region') as typename from QuickSearch where name LIKE  '%"+req.search+"%'";
  
   console.log(searchquery);
   sql.query(searchquery, function(err, res) {
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
module.exports = QuickSearch;

