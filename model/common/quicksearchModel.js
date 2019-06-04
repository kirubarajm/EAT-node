"user strict";
var sql = require("../db.js");
const CronJob = require('cron').CronJob;
const util = require('util');

//const query = util.promisify(sql.query).bind(sql);
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
       
   // Eatuser.eat_explore_store_data_by_cron =  async function eat_explore_store_data_by_cron(search, result) {
    //console.log('Before job instantiation');
    const job = new CronJob(' 00 00 00 * * *',async function(search, result) {
      const d = new Date();
      console.log('At Ten Minutes:', d);
      try {
        const quicksearchquery = await query("Select * from QuickSearch");
        if (quicksearchquery.err) {  
      //     let resobj = {
      //     success: sucobj,
      //     status:false,
      //     result: err
      //   };
    
      //   result(null, resobj);
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
    
        const productquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct product_name as name,productid as id, 1 from Product where product_name IS NOT NULL and active_status = 1 and quantity != 0  and delete_status !=1 group by product_name");
    
      //   if (productquery.err) {  
      //     let resobj = {
      //     success: sucobj,
      //     status:false,
      //     result: err
      //   };
    
      //   result(null, resobj);
      // }else{
    
    
      //  const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  brandname as name,userid as id, 2 from MakeitUser where (brandname IS NOT NULL and brandname != '') and appointment_status = 3 and verified_status = 1");
      const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1 group by mk.userid");
    
      //   if (kitchenquery.err) {  
      //     let resobj = {
      //     success: sucobj,x
      //     status:false,
      //     result: err
      //   };
    
      //   result(null, resobj);
      // }else{
    
        const regionquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct regionname as name,regionid as id, 3 from Region where regionname IS NOT NULL group by regionname");
    
      //   if (regionquery.err) {  
      //     let resobj = {
      //     success: sucobj,
      //     status:false,
      //     result: err
      //   };
    
      //   result(null, resobj);
      // }else{
    
        // let sucobj = true;
        // let resobj = {
        //   success: sucobj,
        //   status:true,
        //   message:"Quick search updated"
        // };
    
        // result(null, resobj);
      }
    
    
    //   }
    // }
    // }
      
      } catch (error) {
        let sucobj = true;
                let resobj = {
                  success: sucobj,
                 // result: res
                };
        
                result(null, resobj);
              }
    });
   // console.log('After job instantiation');
    job.start();  
  //}  
  
  
  QuickSearch.eat_explore_quick_search = function eat_explore_quick_search(req, result) {
    console.log(req.search);
   var searchquery = "select *, IF(type<3, IF(type=2, 'Kitchan', 'Product'), 'Region') as typename from QuickSearch where name LIKE  '%"+req.search+"%'";
  
   console.log(searchquery);
   sql.query(searchquery, function(err, res) {
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
module.exports = QuickSearch;

