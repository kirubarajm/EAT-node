'user strict';
var sql = require('../db.js');

//Task object constructor
var Menuitem = function(menuitem){
    this.makeit_userid = menuitem.makeit_userid;
    this.menuitem_name=menuitem.menuitem_name;
    this.active_status=menuitem.active_status || 1;
    this.vegtype=menuitem.vegtype;
    this.price=menuitem.price;
    this.created_at = new Date();
    this.price = menuitem.price;
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

    sql.query("Select * from Menuitem where makeit_userid = ? ", userId, function (err, res) {             
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

Menuitem.update_a_menuitem_makeit_userid = function(req, result){

    var staticquery = "UPDATE Menuitem SET ";
    var column = '';
    for (const [key, value] of Object.entries(req)) {
        console.log(`${key} ${value}`);

        if (key !== 'menuitemid') {
            // var value = `=${value}`;
            column = column + key + "='" + value + "',";
        }
    }

   var  query = staticquery + column.slice(0, -1)  + " where makeit_userid = " + req.makeit_userid +" and menuitemid = "+req.menuitemid ;

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
                message: message
            };

            result(null, resobj);
        }

    });
  };
  

module.exports= Menuitem;