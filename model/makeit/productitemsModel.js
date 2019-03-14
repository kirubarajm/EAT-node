'user strict';
var sql = require('../db.js');
var Productitem = require('../../model/makeit/productitemsModel.js');

//Task object constructor
var Productitem = function (productitem) {
    this.productid = productitem.productid;
    this.itemid = productitem.itemid;
    this.quantity = productitem.quantity;
};

Productitem.createProductitems = function createProductitems(product_item, res) {

    sql.query("INSERT INTO Productitem set ?", product_item, function (err, result) {
        if (err) {
            console.log("error: ", err);
            res(null, err);
        }

    });

};

module.exports = Productitem;