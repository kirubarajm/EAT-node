'user strict';
var sql = require('../db.js');

//Task object constructor
var Salesuser = function (salesuser) {
    this.name = salesuser.name;
    this.email = salesuser.email;
    this.phoneno = salesuser.phoneno;
    this.address = salesuser.address;
    this.job_type = salesuser.job_type;
    this.referalcode = salesuser.referalcode;
    this.localityid = salesuser.localityid;
    this.password = salesuser.password;
    this.created_at = new Date();
    this.id_proof = salesuser.id_proof;
    this.add_proof = salesuser.add_proof;
    this.birth_cer = salesuser.birth_cer;
};

Salesuser.createUser = function createUser(newUser, result) {

    sql.query("Select * from Sales_QA_employees where phoneno = '" + newUser.phoneno + "' OR email= '" + newUser.email + "' ", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {

            if (res.length == 0) {
                sql.query("INSERT INTO Sales_QA_employees set ?", newUser, function (err, res1) {

                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else {
                        console.log(res.insertId);
                        let sucobj = true;
                        let message = "Registration Sucessfully";
                        let resobj = {
                            success: sucobj,
                            message: message
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

Salesuser.getUserById = function getUserById(userId, result) {
    sql.query("Select * from Sales_QA_employees where id = ? ", userId, function (err, res) {
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

Salesuser.getAllUser = function getAllUser(result) {
    sql.query("Select * from Sales_QA_employees", function (err, res) {

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

Salesuser.updateById = function (id, user, result) {
    sql.query("UPDATE Sales_QA_employees SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Salesuser.remove = function (id, result) {
    sql.query("DELETE FROM Sales_QA_employees WHERE userid = ?", [id], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {

            result(null, res);
        }
    });
};

Salesuser.checkLogin = function checkLogin(req, result) {
    var reqs = [req.email, req.password];
    sql.query("Select * from Sales_QA_employees where email = ? and password = ?", reqs, function (err, res) {
        if (err) {
            console.log("error: ", err);

            let resobj = {
                success: 'false',
                result: err
            };
            result(resobj, null);
        }
        else {
            let sucobj = (res.length == 1) ? 'true' : 'false';
            let resobj = {
                success: sucobj,
                result: res
            };
            console.log("result: ---", res.length);
            result(null, resobj);
        }
    });
};


Salesuser.getAllsalesSearch = function getAllsalesSearch(req, result) {

    var today = new Date();

    //  var query = "Select * from Sales_QA_employees ";

    // var query = "Select se.id,se.name,se.address,se.phoneno,COUNT(al.sales_emp_id) totalassigned from Sales_QA_employees se left join Allocation al on se.id = al.sales_emp_id ";
    var query = "Select se.id,se.name,se.address,se.email,se.password,se.phoneno,COUNT(al.sales_emp_id) totalassigned from Sales_QA_employees se left join Allocation al on se.id = al.sales_emp_id and DATE(al.assign_date) = CURDATE()";
    if (req.search && req.search !== '') {
        query = query + "where se.name LIKE  '%" + req.search + "%'";
    }

    query = query + " group by se.id"
    //DATE(al.assign_date) = CURDATE() 

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


Salesuser.edit_sales_users = function (req, result) {

    if (req.email || req.password || req.phoneno) {

        let sucobj = true;
        let message = "You can't to be Edit email / password/ phoneno";
        let resobj = {
            success: sucobj,
            message: message
        };

        result(null, resobj);
    } else {

        var staticquery = "UPDATE Sales_QA_employees SET updated_at = ?, ";
        var column = '';
        for (const [key, value] of Object.entries(req)) {
            console.log(`${key} ${value}`);

            if (key !== 'userid') {
                // var value = `=${value}`;
                column = column + key + "='" + value + "',";
            }


        }

       var  query = staticquery + column.slice(0, -1) + " where id = " + req.id;
        console.log(query);
        sql.query(query,[new Date()], function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {

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


module.exports = Salesuser;