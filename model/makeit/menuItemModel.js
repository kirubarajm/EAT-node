'user strict';
var sql = require('../db.js');

//Task object constructor
var Menuitem = function(menuitem){
    this.makeit_userid = menuitem.makeit_userid;
    this.menuitem_name=menuitem.menuitem_name;
    this.active_status=menuitem.active_status || 0;
    this.vegtype=menuitem.vegtype;
    this.price=menuitem.price;
    this.approved_status=menuitem.approved_status ||0;
  //  this.created_at = new Date();
   // this.price = menuitem.price;
};

/*
this.product_name = menuitem.product_name;
    this.makeit_userid = menuitem.makeit_userid;
    this.image=menuitem.image;
    this.active_status=menuitem.active_status;
    this.vegtype=menuitem.vegtype;
*/

Menuitem.createMenuitem = function createMenuitem(newMenuitem, result) {    
        sql.query("INSERT INTO Menuitem set ?", newMenuitem, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    let sucobj=true;
                    let megobj = "Menu Item Created Successful";
                    let resobj = {  
                    success: sucobj,
                    message:megobj, 
                    result: res.insertId
                    }; 

                 result(null, resobj);
                }
            });           
};

Menuitem.getMenuitemById = function getMenuitemById(userId, result) {
        sql.query("Select * from Menuitem where menuitemid = ? ", userId, function (err, res) {             
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

Menuitem.getAllMenuitem = function getAllMenuitem(result) {
        sql.query("Select * from Menuitem", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Menuitem : ', res); 
                  let sucobj=true;
                  let resobj = {  
                    success: sucobj,
                    result: res 
                    }; 

                 result(null, resobj);
                }
            });   
};

Menuitem.updateById = function(id, user, result){
  sql.query("UPDATE Menuitem SET task = ? WHERE menuitemid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Menuitem.remove = function(id, result){
     sql.query("DELETE FROM Menuitem WHERE menuitemid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};


Menuitem.get_Menuitem_By_makeitid = function get_Menuitem_By_makeitid(userId, result) {

    sql.query("Select * from Menuitem  where makeit_userid = ? ", userId, function (err, res) {             
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                let sucobj=true;
                let resobj = {  
                    success: sucobj,
                    status:true,
                    result: res 
                 }; 
                 result(null, resobj);
            }
        });   
};

Menuitem.update_a_menuitem_makeit_userid = function(req, result){

  sql.query(" select * from Productitem where productid = "+req.menuitemid+"", function (err, res) {
    if(err) {
        console.log("error: ", err);
        result(null, err);
    }
    else{

      if (res.length === 0) {

    var staticquery = "UPDATE Menuitem SET ";
    var column = '';
    for (const [key, value] of Object.entries(req)) {
        console.log(`${key} ${value}`);

        if (key !== 'menuitemid') {
            // var value = `=${value}`;
            column = column + key + "='" + value + "',";
        }
    }

   var  query = staticquery + column.slice(0, -1)  + " ,approved_status = 3 where makeit_userid = " + req.makeit_userid +" and menuitemid = "+req.menuitemid ;

    console.log(query);
    sql.query(query, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {

            let sucobj = true;
            let message = " Menu item updated successfully"
            let resobj = {
                success: sucobj,
                status:true,
                message: message
            };

            result(null, resobj);
        }

    });
  }else{

    let sucobj = true;
    let message = " Sorry Already added product, so you can't edit the menuitem"
    let resobj = {
        success: sucobj,
        status:false,
        message: message
    };

    result(null, resobj);
  }
  }
});
  };
  

  Menuitem.approve_menuitem_status =  function(req, result){

    sql.query(" select * from Menuitem where menuitemid = "+req.menuitemid+" ", function (err, res) {
      if(err) {
          console.log("error: ", err);
          result(null, err);
      }
      else{

        if (res.length !== 0) {
      
  
            if (res[0].active_status == 0) {
  
              if (res[0].approved_status == 0 || res[0].approved_status == 3) {
  
                var query = "UPDATE Menuitem SET approved_time= ?,approved_status = "+req.approved_status+",approvedby=0  WHERE productid = "+req.menuitemid+"";
              sql.query(query, new Date(), function (err, res1) {
                if(err) {
                    console.log("error: ", err);
                      result(null, err);
                   }
                 else{   
                 
                
                     var  message = "Menuitem approved successfully"
                  
                      let sucobj=true;
                      let resobj = {  
                        success: sucobj,
                        status:true,
                        message:message,
                        }; 
          
                     result(null, resobj);
                      }
                  }); 
  
                }else if(res[0].approved_status == 1){
                  
                      let sucobj=true;
                      let resobj = {  
                        success: sucobj,
                        status:false,
                        message: "Menuitem Already approved",
                        }; 
          
                     result(null, resobj);
  
                }else if(res[0].approved_status == 2){
                  console.log('test');
                      let sucobj=true;
                      let resobj = {  
                        success: sucobj,
                        status:false,
                        message: "Menuitem Already rejected",
                        }; 
          
                     result(null, resobj);
                }
            } else if(res[0].active_status == 1){
              console.log('test');
                      let sucobj=true;
                      let resobj = {  
                        success: sucobj,
                        status:false,
                        message: "Menuitem is live now",
                        }; 
          
                     result(null, resobj);
            }
  
          }else{
            let sucobj=true;
            let resobj = {  
              success: sucobj,
              status:false,
              message: "menuitem is not available",
              }; 
  
           result(null, resobj);
          }
            }
    });      
  };


  
  Menuitem.admin_list_all__unapproval_menuitem = function admin_list_all__unapproval_menuitem(req,result) {


    console.log(req);

    var query = "Select * from Menuitem where  active_status !=1 and approved_status !=1 and approved_status !=2 "

    console.log(req.approved_status);

    if(req.approved_status === 0){

      query = query+" and approved_status = '"+req.approved_status+"' order by created_at desc";

     }else if(req.approved_status ===3){
      query = query+" and approved_status = '"+req.approved_status+"' order by updated_at desc";
     }

  

   console.log(query);

        sql.query(query, function (err, res) {

          if(err) {
            console.log("error: ", err);  
            result(null, err);
        }
        else{
          console.log('Product : ', res);  
          let sucobj=true;
          let resobj = {  
            success: sucobj,
            status:true,
            result: res 
            }; 

         result(null, resobj);
        }
});   
};


Menuitem.update_delete_status =  function(itemid, result){
 
 
  sql.query(" select * from Productitem where itemid = "+itemid+"", function (err, res) {
    if(err) {
        console.log("error: ", err);
        result(null, err);
    }
    else{

      if (res.length === 0) {

  sql.query(" select * from Menuitem where menuitemid = "+itemid+" " , function (err, res) {
    if(err) {
        console.log("error: ", err);
        result(null, err);
    }
    else{
      
      if (res.length !== 0) {

          if (res[0].active_status == 0) {
            console.log('test1');

            if (res[0].delete_status !== 1) {

            sql.query("UPDATE Menuitem SET delete_status = 1 WHERE menuitemid = "+itemid+" ",  function (err, res1) {
              if(err) {
                  console.log("error: ", err);
                    result(null, err);
                 }
               else{   
               
  
                    let sucobj=true;
                    let resobj = {  
                      success: sucobj,
                      status:true,
                      message: "menuitem Delete successfully",
                      }; 
        
                   result(null, resobj);
                    }
                }); 
              }else{

                let sucobj=true;
                    let resobj = {  
                      success: sucobj,
                      status:false,
                      message: "menuitem already deleted",
                      }; 
        
                   result(null, resobj);

              }
          } else if(res[0].active_status == 1){
            console.log('test');
                    let sucobj=true;
                    let resobj = {  
                      success: sucobj,
                      status:false,
                      message: "menuitem is live now, You can't delete",
                      }; 
        
                   result(null, resobj);
          }

        }else{
          let sucobj=true;
          let resobj = {  
            success: sucobj,
            status:false,
            message: "menuitem is not available",
            }; 

         result(null, resobj);
        }
          }
  }); 
  
}else{

  let sucobj = true;
  let message = " Sorry Already added product, so you can't delete the menuitem"
  let resobj = {
      success: sucobj,
      status:false,
      message: message
  };

  result(null, resobj);
}
}
}); 
};



module.exports= Menuitem;