"user strict";
var sql       = require("../db.js");
const CronJob = require('cron').CronJob;
const util    = require('util');
var moment    = require("moment");
var constant  = require("../constant");
var producthistory = require("../../model/makeit/liveproducthistoryModel.js");

const query = util.promisify(sql.query).bind(sql);
var QuickSearch = function(QuickSearch){
    this.eatuserid = QuickSearch.eatuserid;
    this.productid = QuickSearch.productid || 0;
    //this.created_at = new Date();
    this.makeit_userid = QuickSearch.makeit_userid || 0;
};

QuickSearch.eat_explore_store_data_by_cron =  async function eat_explore_store_data_by_cron(search, result) {
  // try {
  const quicksearchquery = await query("Select * from QuickSearch");
  if (quicksearchquery.err) {  
    let resobj = {
      success : sucobj,
      status  : false,
      result  : err
    };
    result(null, resobj);
  }else{
    if (quicksearchquery) {
      const truncatequery = await query("truncate QuickSearch");
      if (truncatequery.err) {  
        let resobj = {
          success : sucobj,
          status  : false,
          result  : err
        };
        result(null, resobj);
      }
    }
  
    var breatfastcycle = constant.breatfastcycle;
    var dinnercycle    = constant.dinnercycle;
    var lunchcycle     = constant.lunchcycle;
    var day            = moment().format("YYYY-MM-DD HH:mm:ss");
    var currenthour    = moment(day).format("HH");
    var cyclequery     = "";
    if (currenthour < lunchcycle) {
      cyclequery = cyclequery + " and pt.breakfast = 1";
      //  console.log("breakfast");
    }else if(currenthour >= lunchcycle && currenthour <= dinnercycle){
      cyclequery = cyclequery + " and pt.lunch = 1";
      //  console.log("lunch");
    }else if( currenthour >= dinnercycle){
      cyclequery = cyclequery + " and pt.dinner = 1";
      //  console.log("dinner");
    }

    //  const productquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct product_name as name,productid as id, 1 from Product where product_name IS NOT NULL group by product_name");
    var productquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct pt.product_name as name,pt.productid as id, 1 from Product pt join MakeitUser mk on mk.userid = pt.makeit_userid where (pt.product_name IS NOT NULL and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1 "+cyclequery+")and(mk.appointment_status = 3 and mk.verified_status = 1 and ka_status = 2)  group by pt.product_name");
      if (productquery.err) {  
        let resobj = {
          success : sucobj,
          status  : false,
          result  : err
        };
        result(null, resobj);
      }else{
        //  const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1");
        // const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and pt.active_status =1 and pt.quantity != 0  and pt.delete_status !=1 group by mk.userid");
        const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 "+cyclequery+") group by mk.userid");
        if (kitchenquery.err) {  
          let resobj = {
            success: sucobj,
            status:false,
            result: err
          };
          result(null, resobj);
        }else{
          //  const regionquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct regionname as name,regionid as id, 3 from Region where regionname IS NOT NULL group by regionname");
          const regionquery = await query("INSERT INTO QuickSearch (name,id, type)  SELECT distinct regionname as name,regionid as id, 3 from Region where regionid IN (SELECT  mk.regionid from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid  where  mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 "+cyclequery+" ) group by mk.regionid )  and regionname IS NOT NULL  group by regionid");
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
              success : sucobj,
              status  : true,
              message : "Quick search updated"
            };
            result(null, resobj);
          }
        }
      }
    }
  // } catch (error) {
  //    let sucobj = true;
  //    let resobj = {
  //      success : sucobj,
  //      result  : res
  //     };
  //     result(null, resobj);
  // }
  }
       
  // This cron is to running all region and product and makeit to quick search
  //console.log('Before job instantiation');
  const job = new CronJob('0 */1 * * * *',async function(search, result) {
    sql.query("Select * from QuickSearch", function( err,res) {
      if (err) {
        console.log("error: ", err);
        //result(err, null);
      } else {
        sql.query("truncate QuickSearch",async function( err,res1) {
          if (err) {
            console.log("error: ", err);
            //  result(err, null);
          } else {
            var breatfastcycle = constant.breatfastcycle;
            var dinnercycle    = constant.dinnercycle;
            var lunchcycle     = constant.lunchcycle;
            var day            = moment().format("YYYY-MM-DD HH:mm:ss");
            var currenthour    = moment(day).format("HH");
            var cyclequery     = "";
            if (currenthour < lunchcycle) {
              cyclequery = cyclequery + " and pt.breakfast = 1";
              //  console.log("breakfast");
            }else if(currenthour >= lunchcycle && currenthour <= dinnercycle){
              cyclequery = cyclequery + " and pt.lunch = 1";
              //  console.log("lunch");
            }else if( currenthour >= dinnercycle){
              cyclequery = cyclequery + " and pt.dinner = 1";
              //  console.log("dinner");
            }
            const proquery     = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct pt.product_name as name,pt.productid as id, 1 from Product pt join MakeitUser mk on mk.userid = pt.makeit_userid where (pt.product_name IS NOT NULL and pt.active_status = 1 and pt.quantity != 0 and pt.delete_status !=1)and(mk.appointment_status = 3 and mk.verified_status = 1 and ka_status = 2)  group by pt.product_name");
            const kitchenquery = await query("INSERT INTO QuickSearch (name,id, type) SELECT  mk.brandname as name,mk.userid as id, 2 from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid where (mk.brandname IS NOT NULL and brandname != '') and mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 "+cyclequery+") group by mk.userid");
            const regionquery  = await query("INSERT INTO QuickSearch (name,id, type) SELECT distinct regionname as name,regionid as id, 3 from Region where regionid IN (SELECT  mk.regionid from MakeitUser mk join Product pt on pt.makeit_userid=mk.userid  where  mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2 and (pt.active_status = 1 and pt.quantity != 0  and pt.delete_status !=1 "+cyclequery+" ) group by mk.regionid ) and regionname IS NOT NULL  group by regionid");
          }
        });
      }
    });
  });
  job.start();  
   
  //incomplete online and release product quantity and order release by user.
  const job1 = new CronJob('*/3 * * * *',async function(){
    var res = await query("select * from Orders where lock_status = 1 and payment_type = 1 and orderstatus = 0 ");//and created_at > (NOW() - INTERVAL 10 MINUTE
    // console.log("cron for product revert online orders in-complete orders"+res);
    if (res.length !== 0) {
      for (let i = 0; i < res.length; i++) {
        var today     = moment();
        var ordertime = moment(res[i].ordertime);
        var diffMs    = (today - ordertime);
        var diffDays  = Math.floor(diffMs / 86400000); 
        var diffHrs   = Math.floor((diffMs % 86400000) / 3600000);
        var diffMins  = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        console.log(diffMins);
        ///Online payment unsucesssfull orders above 30 min to revert to poduct and cancel that order 
        if (diffMins > 30){
          var lockres = await query("select * from Lock_order where orderid ='"+ res[i].orderid+"' ");
          if (lockres.length !== 0) {
            for (let j = 0; j < lockres.length; j++) {
              var productquantityadd = await query("update Product set quantity = quantity+" +lockres[j].quantity +" where productid =" +lockres[j].productid +"");
              var updatequery = await query("update Orders set orderstatus = 9,payment_status= 2 where orderid = '"+res[i].orderid+"'");
            }
          }
        }
      }
    }
  });
  job1.start();

  QuickSearch.eat_explore_quick_search = function eat_explore_quick_search(req, result) {
    // var searchquery = "select *, IF(type<3, IF(type=2, 'Kitchan', 'Product'), 'Region') as typename from QuickSearch where name LIKE  '%"+req.search+"%'";
    var searchquery = "select searchid,id,name,type, IF(type<3, IF(type=2, 'Kitchan', 'Product'), 'Region') as typename from QuickSearch where name LIKE  '%"+req.search+"%'";
    sql.query(searchquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        for (let i = 0; i < res.length; i++) {
          if (res[i].type == 1) { }
        }
        let resobj = {
            success : true,
            status  : true,
            result  : res
        };
        result(null, resobj);
      }
    });
  };

  ///// Cron For BreakFast, Lunch, Dinner Every Cycle Start and End ///////////
  const liveproducthistory = new CronJob('* *8,12,16,23 * * *',async function(req,result){
    var breatfastcycle = constant.breatfastcycle;
    var lunchcycle     = constant.lunchcycle;
    var dinnercycle    = constant.dinnerend+1; //22+1
    var day            = moment().format("YYYY-MM-DD HH:mm:ss");
    var currenthour    = moment(day).format("HH");
    var CSselectquery  = "";
    var CSwherequery   = "";
    var CEselectquery  = "";
    var CEwherequery   = "";
    var cyclestart = 0;
    var cycleend   = 0;
    
    if(currenthour==breatfastcycle){
      cyclestart = 1;
      CSselectquery = " 3 as action,";        /////// Cycle Start ////
      CSwherequery  = " and prd.breakfast=1";
    }else if(currenthour==lunchcycle){
      cycleend   = 1;
      cyclestart = 1;
      CEselectquery = " 4 as action,";        ////// Cycle End ////
      CEwherequery  = " and prd.breakfast=1";
      CSselectquery = " 3 as action,";        ////// Cycle Start ////
      CSwherequery  = " and prd.lunch=1";      
    }else if(currenthour==dinnercycle){
      cycleend   = 1;
      cyclestart = 1;
      CEselectquery = " 4 as action,";        ////// Cycle End ////
      CEwherequery  = " and prd.lunch=1";
      CSselectquery = " 3 as action,";        ////// Cycle Start ////
      CSwherequery  = " and prd.dinner=1";      
    }else if(currenthour==23){
      cycleend = 1;
      CEselectquery = " 4 as action,";        ////// Cycle End ////
      CEwherequery  = " and prd.dinner=1";
    }else{ }

    if(breatfastcycle && lunchcycle && dinnercycle){
      if(cyclestart == 1){
        const getproductdetailscs = await query("select"+CSselectquery+" prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN oi.quantity ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 THEN oi.quantity ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) where prd.active_status = 1 and prd.delete_status !=1 "+CSwherequery+" group by prd.productid");
        console.log(getproductdetailscs);
        if (getproductdetailscs.err) {
          //result(err, null); 
          console.log(getproductdetailscs.err);
        }else{
          for(var i=0; i<getproductdetailscs.length; i++){
            var inserthistory = await producthistory.createProducthistory(getproductdetailscs[i]);
          }
        }
      }
      if(cycleend == 1){
        const getproductdetailsce = await query("select"+CEselectquery+" prd.makeit_userid as makeit_id,prd.productid as product_id,prd.quantity as actual_quantity, SUM(CASE WHEN ord.orderstatus=6 THEN oi.quantity ELSE 0 END) as ordered_quantity, SUM(CASE WHEN ord.orderstatus<=5 THEN oi.quantity ELSE 0 END) as pending_quantity from Product as prd left join Orders as ord on (ord.makeit_user_id = prd.makeit_userid and (Date(ord.ordertime)=CURDATE())) left join OrderItem as oi on (oi.orderid = ord.orderid and oi.productid=prd.productid) where prd.active_status = 1 and prd.delete_status !=1 "+CEwherequery+" group by prd.productid");
        if (getproductdetailsce.err) { 

        }else{
          for(var i=0; i<getproductdetailsce.length; i++){
            var inserthistory = await producthistory.createProducthistory(getproductdetailsce[i]);
          }
        }
      }
    } 
  });
  //liveproducthistory.start();

module.exports = QuickSearch;