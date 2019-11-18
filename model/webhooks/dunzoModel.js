'user strict';
var sql = require('../db.js');
var dunzoconst = require('../../model/dunzo_constant');

//Task object constructor
var Dunzo = function(dunzo){
    this.makeit_userid = dunzo.makeit_userid;
    this.rating = dunzo.rating;
};

Dunzo.testingapi = function testingapi(req, result) {
    //console.log(dunzoconst);
    switch(req.state){
        case dunzoconst.created:
            console.log("created");
            break;
        case dunzoconst.queued:
            console.log("queued");
            break;
        case dunzoconst.runner_accepted:
            console.log("runner_accepted");
            break;
        case dunzoconst.runner_cancelled:
            console.log("runner_cancelled");
            break;
        case dunzoconst.reached_for_pickup:
            console.log("reached_for_pickup");
            break; 
        case dunzoconst.pickup_complete:
            console.log("pickup_complete");
            break;
        case dunzoconst.started_for_delivery:
            console.log("started_for_delivery");
            break;
        case dunzoconst.reached_for_delivery:
            console.log("reached_for_delivery");
            break;
        case dunzoconst.delivered:
            console.log("delivered");
            break;
        case dunzoconst.cancelled:
            console.log("cancelled");
            break;         
        default:
            console.log("No State");
    }
    result(null, req);
};

module.exports= Dunzo;