const connection = require("../config/mysqldb");
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// const auth = require("../middleware/auth");

const operations = [];
const sha = require('js-sha512');
const util = require("./util");

function sqlFunction($sql, $params = []) {
    return new Promise((resolve, reject) => {
        connection.query($sql, $params, function (error, results) {
            if (error) {
                reject(error);
            }
            else {
                resolve(results == undefined ? [] : results);
            }
        });
    });
}
//step 1
let returnData;
let sql;
operations['sign_otp_generate'] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "response_status": 400
        });
    }
    let mobileno = req.body.mobileno;
    let cond = req.params.cond == undefined ? 0 : req.params.cond;
    let flag = false;
    let msg = "User already exists, please choose login option";
    try {
        sql = "SELECT user_id FROM tbl_user_login WHERE mobile =?";
        returnData = await sqlFunction(sql, [mobileno]);
        if (cond == 1) {
            if (returnData.length > 0) {
                flag = true;
            }
            else {
                msg = "User must be registered first";
            }
        }
        else {
            flag = returnData.length == 0 ? true : false;
        }
        if (flag) {
            let otp = util.randomString(6, '#');
            // let sms = util.sms(mobileno,3,"1307162382441438269", "आपका OTP "+otp+" है| CGQDC");
            let sms = util.sms(mobileno, 3, "1307164794087866691", "जनशिकायत में आपका लॉग इन हेतु सत्यापन OTP " + otp + " है | जनशिकायत छत्तीसगढ़, चिप्स");
            sms.then((status) => {
                if (status == 200) {
                    sql = "INSERT INTO tbl_otp_verification (otp,mobile) VALUES (?,?)";
                    let lastCheck = sqlFunction(sql, [otp, mobileno]);
                    lastCheck.then((returnData) => {
                        if (returnData.affectedRows != undefined && returnData.affectedRows > 0) {
                            res.send({
                                message: "otp successfully generated",
                                "otp": otp, "response_status": 200
                            });
                        }
                        else {
                            res.send({ message: "try again", "response_status": 403 });
                        }
                    }).catch((error) => {
                        console.log(error);
                    });
                }

            }).catch((error) => {
                console.log(error);
            });
        }
        else {//Forbidden
            res.send({ message: msg, "response_status": 403 });
        }
    } catch (e) {
        console.log(e);//Bad Request
        res.send({ message: "Error", "response_status": 400 });
    }
};
//step 2
operations['signup_otp_verify'] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "response_status": 400
        });
    }
    let mobileno = req.body.mobileno;
    let otp = req.body.otp;
    try {
        sql = "UPDATE tbl_otp_verification SET is_verified = ? WHERE mobile =? AND otp = ? AND is_verified = ?";
        returnData = await sqlFunction(sql, [1, mobileno, otp, 0]);
        if (returnData.affectedRows != undefined && returnData.affectedRows > 0) {
            res.send({ message: "otp is verified", "response_status": 200 });
        }
        else {
            //Unauthorized
            res.send({ message: "otp is invalid", "response_status": 401 });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: "Error", "response_status": 400 });
    }
};
//step 3
operations['usersignup'] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "response_status": 400
        });
    }
    let username = req.body.mobileno;
    let password = req.body.password;
    let applicantname = req.body.applicantname;
    let is_csc_operator = req.body.is_csc_operator;
    let role_id = "";

    if (is_csc_operator != undefined || is_csc_operator != null || is_csc_operator != "") {
        if (is_csc_operator == "Y") {
            console.log("Y...")
            role_id = 2; // for csc user
        } else {
            //console.log("N...")
            role_id = 1; // for public users
        }
    } else {
        role_id = 1; // for public users
    }

    try {
        sql = "SELECT mobile FROM tbl_user_login WHERE mobile =?";
        returnData = await sqlFunction(sql, [username]);
        if (returnData.length == 0) {
            // const util=require("./util");
            let salt_pass_first = util.encrykey + password + util.encrykey;
            let hased_pass_first = sha(salt_pass_first);
            let salt = util.randomString(8, '#aA');
            let hashed_password = sha(hased_pass_first + salt);
            let created_ip = req.ip;
            // console.log(hashed_password);

            sql = "INSERT INTO tbl_user_login (mobile,fullname,user_password,salt,role_id,created_ip) VALUES (?,?,?,?,?,?)";
            returnData = await sqlFunction(sql, [username, applicantname, hashed_password, salt, role_id, created_ip]);
            if (returnData.affectedRows != undefined && returnData.affectedRows > 0) {
                var last_insert_id = returnData.insertId;
                console.log("last_insert_id : " + last_insert_id);
                if (last_insert_id > 0) {

                    let generatedUserId = "U" + last_insert_id.toString().padStart(8, "0");

                    sql = `UPDATE tbl_user_login SET user_id = ? WHERE id =?`;
                    returnData = await sqlFunction(sql, [generatedUserId, last_insert_id]); // 
                    if (returnData.affectedRows != undefined && returnData.affectedRows > 0) {
                        console.log("User Id Updated.....");
                        //res.send({ message: "User Sign Up Successfully. Your UserId:" +generatedUserId,"response_status": 200});
                        res.send({ message: "User Sign Up Successfully.", "response_status": 200 });
                    } else {
                        res.send({ message: "Error", "response_status": 400 });
                    }
                }

            }
            else {
                res.send({ message: "Error", "response_status": 400 });
            }

        }
        else {
            res.send({ message: "User already exists", "response_status": 403 });
        }
        // }
        // else {
        //     res.send({ message: "Otp is not verified","response_status": 400 });
        // }
    } catch (e) {
        console.log(e);
        res.send({ message: "Error in Inserting Data", "response_status": 400 });
    }
};
//step 4
operations['userlogin'] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "response_status": 400
        });
    }

    let { user_id, password } = req.body;
    try {
        sql = "SELECT salt FROM tbl_user_login WHERE mobile =? LIMIT 1";
        returnData = await sqlFunction(sql, [user_id]);
        if (returnData.length > 0) {
            sql = "SELECT user_id FROM `aadhar_ref` WHERE user_id =?";
            returnDataA = await sqlFunction(sql, [user_id]);
            if (returnDataA.length > 0) {
                const util = require("./util");
                let salt_pass_first = util.encrykey + password + util.encrykey;
                let hased_pass_first = sha(salt_pass_first);
                let hashed_password = sha(hased_pass_first + returnData[0].salt);

                let sql = "SELECT `id` `user_id`,role_id,mobile, `fullname` FROM tbl_user_login WHERE mobile =? and user_password=?";
                let results = await sqlFunction(sql, [user_id, hashed_password]);
                if (results.length > 0) {
                    // res.send({ message: "Login Successfull" });
                    const payload = {
                        user: {
                            id: results.id
                        }
                    };
                    jwt.sign(
                        payload,
                        "secret",
                        {
                            expiresIn: 3600 * 4
                        },
                        (err, token) => {
                            if (err) throw err;
                            // console.log(results);
                            res.json({
                                "token": token,
                                "uid": results[0]['user_id'],
                                "uname": results[0]['fullname'],
                                "role_id": results[0]['role_id'],
                                "mobile": results[0]['mobile'],
                                "response_status": 200
                            });
                        }
                    );
                }
                else {
                    res.json({
                        "message": "Username or Password is incorrect",
                        "response_status": 401
                    });
                }
            }
            else {
                res.json({
                    "message": "User not verified with Aadhar", "response_status": 401
                });
            }
        } else {
            res.json({
                "message": "User Does Not Exist", "response_status": 401
            });
        }
    } catch (e) {
        //console.log(e);
        res.json({ "message": "Error in Finding Data", "response_status": 400 });
    }
};


module.exports = operations;
