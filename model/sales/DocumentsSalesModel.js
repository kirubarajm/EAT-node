'user strict';
var sql = require('../db.js');

//Task object constructor
var Documentsales = function (documentsales) {
    this.remarks = documentsales.remarks;
    this.sales_userid = documentsales.sales_userid;
    this.makeit_userid = documentsales.makeit_userid;
    this.created_at = new Date();    
};



module.exports= Documentsales;