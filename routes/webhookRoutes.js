"use strict";
module.exports = function(app) {
    var routesVersioning = require('express-routes-versioning')();
    var DunzoController = require("../controllers/webhooks/dunzoController.js");
    var middleware = require('../model/middleware.js');

    app.route("/webhooks/dunzo").post(routesVersioning({"1.0.0": DunzoController.testapi}));
}