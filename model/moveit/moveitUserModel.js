'user strict';
var sql = require('../db.js');

var Documentmoveit = require('../../model/common/documentsMoveitModel.js');

//Task object constructor
var Moveituser = function (moveituser) {
    this.name = moveituser.name;
    this.email = moveituser.email;
    this.phoneno = moveituser.phoneno;
    this.bank_account_no = moveituser.bank_account_no;
    this.vehicle_no = moveituser.vehicle_no;
    this.verified_status = moveituser.verified_status;
    this.online_status = moveituser.online_status;
    this.referalcode = moveituser.referalcode;
    this.localityid = moveituser.localityid;
    this.password = moveituser.password;
    this.created_at = new Date();
    this.bank_name = moveituser.bank_name;
    this.ifsc = moveituser.ifsc;
    this.bank_holder_name = moveituser.bank_holder_name;
    this.moveit_hub = moveituser.moveit_hub;
    this.driver_lic = moveituser.driver_lic;
    this.vech_insurance = moveituser.vech_insurance;
    this.vech_rcbook = moveituser.vech_rcbook;
    this.photo = moveituser.photo;
    this.legal_document = moveituser.legal_document;
    this.branch = moveituser.branch;
};

Moveituser.createUser = function createUser(newUser, result) {
    sql.query("Select * from MoveitUser where phoneno = '" + newUser.phoneno + "' OR email= '" + newUser.email + "' ", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {

            if (res.length == 0) {

                sql.query("INSERT INTO MoveitUser set ?", newUser, function (err, res1) {

                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else {

                        //    newdocument.moveit_userid = res1.insertId;
                        //    console.log(newdocument);
                        //    newdocument = new Documentmoveit(newdocument);


                        //    Documentmoveit.createnewDocument(newdocument, function (err, result) {
                        //     if (err)
                        //     result.send(err);
                        //     // res.json(result);
                        // });


                        let sucobj = true;
                        let message = 'Moveit user created successfully';
                        let resobj = {
                            success: sucobj,
                            message: message,
                            id: res.insertId

                        };

                        result(null, resobj);

                    }
                });
            } else {

                let sucobj = true;
                let message = "Following user already Exist! Please check it mobile number / email";
                let resobj = {
                    success: sucobj,
                    message: message
                };

                result(null, resobj);
            }
        }
    });
};

Moveituser.getUserById = function getUserById(userId, result) {
    sql.query("Select * From MoveitUser where userid = ? ", userId, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                result: res
            };

            result(null, resobj);

        }
    });
};



Moveituser.admin_getUserById = function getUserById(userId, result) {
    sql.query("Select mu.*,mh.area_name From MoveitUser mu left join Moveit_hubs mh  on mu.moveit_hub = mh.moveithub_id where mu.userid = ? ", userId, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                result: res
            };

            result(null, resobj);

        }
    });
};




Moveituser.getAllUser = function getAllUser(result) {
    sql.query("Select * from MoveitUser", function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('User : ', res);

            result(null, res);
        }
    });
};

Moveituser.updateById = function (id, user, result) {
    sql.query("UPDATE MoveitUser SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Moveituser.remove = function (id, result) {
    sql.query("DELETE FROM MoveitUser WHERE userid = ?", [id], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {

            result(null, res);
        }
    });
};

Moveituser.checkLogin = function checkLogin(req, result) {
    var reqs = [req.phoneno, req.password];
    sql.query("Select * from MoveitUser where phoneno = ? and password = ? limit 1", reqs, function (err, res) {
        if (err) {
            console.log("error: ", err);

            let resobj = {
                success: 'false',
                result: err
            };
            result(resobj, null);
        }
        else {


            let sucobj = (res.length !== 0) ? 'true' : 'false';
            let resobj = {
                success: sucobj,
                result: res
            };
            console.log("result: ---", res.length);
            result(null, resobj);
        }
    });
};





Moveituser.getAllmoveitSearch = function getAllmoveitSearch(req, result) {

    req.vacant = req.vacant || 'all'

    var query = "Select * from MoveitUser";

    console.log(req.vacant);
    if (req.vacant !== 'all') {
        query = query + " where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6) ";
    }

    if (req.vacant !== 'all' && req.search) {
        query = query + " and name LIKE  '%" + req.search + "%'";
    } else if (req.search) {
        query = query + " where name LIKE  '%" + req.search + "%'";
    }


    sql.query(query, function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                result: res
            };

            result(null, resobj);

        }
    });
};



Moveituser.update_online_status = function (req, result) {


    sql.query("UPDATE MoveitUser SET online_status = ? WHERE userid = ?", [req.online_status, req.userid], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            if (req.online_status == 1) {
                key = "Moved online";
                key1 = true;
            } else {
                key = "Moved offline";
                key1 = false;
            }
            let sucobj = true;
            let message = key;
            let onlinestatus = key1;
            let resobj = {
                success: sucobj,
                message: message,
                onlinestatus: onlinestatus
            };

            result(null, resobj);
        }
    });
};

Moveituser.get_a_hub_navigation = function get_a_hub_navigation(req, result) {
    sql.query("select userid,name,mh.* from MoveitUser mu join Moveit_hubs mh on mh.moveithub_id=mu.moveit_hub where mu.userid  = ? ", req.userid, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                result: res
            };

            result(null, resobj);

        }
    });
};


Moveituser.edit_moveit_user = function (req, result) {
    if (req.email || req.password || req.phoneno) {

        let sucobj = true;
        let message = "You can't to be Edit email / password/ phoneno";
        let resobj = {
            success: sucobj,
            message: message
        };

        result(null, resobj);
    } else {

        staticquery = "UPDATE MoveitUser SET ";
        var column = '';
        for (const [key, value] of Object.entries(req)) {
            //  console.log(`${key} ${value}`); 

            if (key !== 'userid') {
                // var value = `=${value}`;
                column = column + key + "='" + value + "',";
            }


        }
        query = staticquery + column.slice(0, -1) + " where userid = " + req.userid;
        console.log(query);
        sql.query(query, function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            } else {
                let sucobj = true;
                let message = "Updated successfully"
                let resobj = {
                    success: sucobj,
                    message: message
                };

                result(null, resobj);
            }

        });
    }
};


module.exports = Moveituser;