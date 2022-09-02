const connection = require("../config/mysqldb");
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const Encryption = require('node_triple_des');

// const auth = require("../middleware/auth");

const operations = [];
const sha = require('js-sha512');
const util = require("./util");
const { INTEGER } = require("sequelize");

function sqlFunction($sql, $params = []) {
    return new Promise((resolve, reject) => {
        connection.connection.query($sql, $params, function (error, results) {
            if (error) {
                reject(error);
            }
            else {
                resolve(results == undefined ? [] : results);
            }
        });
    });
}


operations['userRegistration'] = async (req, res) =>{
    
    try{

        let username = req.body.fnam;
        let mobile = req.body.Number;
        let dob = req.body.dob;
        let email = req.body.email;
        let gender = req.body.gender;
        let is_department = req.body.is_department;
        let user_unique_id = new Date().getTime();


        userInsertion = await sqlFunction(`INSERT INTO tbl_user_details
        (user_id,u_name, mobile, dob, email, gender, is_department)
        VALUES (?,?,?,?,?,?,?)`, [user_unique_id,username,mobile, dob, email, gender, is_department]);
        console.log("-------------------------------", userInsertion);
        if (userInsertion.affectedRows > 0) {
            res.json({
                data:srn,
                status:200,
                message:"Data Fatched Successfully"
            })
        }
        else{
            res.json({              
                status:400,
                message:"No Data Found"
            })
        }
        //res.json({ "message": "Inside Try Block "+new Date().getTime(), "response_status": 200 });
    }
    catch(e){
        res.json({ "message": "Error in Finding Data" + e, "response_status": 400 });
    }
    
}


module.exports = operations;

