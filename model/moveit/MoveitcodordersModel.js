'user strict';
var sql = require('../db.js');
var request = require("request");
var Constant =require("../constant")
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var constant = require('../constant.js');
var moment = require("moment");


//Task object constructor
var MoveitcodOrders = function (moveitcodOrders) {
    this.orderid = moveitcodOrders.orderid ;
    this.moveit_user_id = moveitcodOrders.moveit_user_id;
    this.amounttype = moveitcodOrders.amounttype;
    this.payment_status = moveitcodOrders.payment_status;
    this.amount = moveitcodOrders.amount;
  //  this.created_at = new Date();   
};

MoveitcodOrders.create_Moveit_cod_Orders = function create_Moveit_cod_Orders(MoveitcodOrders, result) {

sql.query("INSERT INTO Moveit_cod_orders set ?", MoveitcodOrders, function (err, res1) {
        if (err) {
        console.log("error: ", err);
        result(err, null);
        } else {
             let resobj = {
            success: true,
            status : true,
            message: 'Moveit_cod_orders  created successfully',
            id: res1.insertId
            };

            result(null, resobj);

    }
});
   
};

module.exports = MoveitcodOrders;