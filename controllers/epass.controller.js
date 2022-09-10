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
        let gender = req.body.Gender;
        let is_department = req.body.is_department;
        let add = req.body.pubaddress;
        let deplist = req.body.publicadd;
        let desig = req.body.designation;
        let depadd = req.body.depaddress;
        let depidproof = req.body.depid;
        let pubid = req.body.idproof;
        let user_unique_id = new Date().getTime();
        let district = req.body.District;
        let blocknagar = req.body.block_id;
        let nikay = req.body.nagar_id;
        let gp = req.body.gp_id;
        let  gram = req.body.village_id;
        let  ward = req.body.Ward;
       


        userInsertion = await sqlFunction(`INSERT INTO tbl_user_details
        (user_id,u_name, mobile, dob, email, gender, is_department,dep_list,Designation,dep_address,dep_id_proof,pub_add,pub_id,district_id,block_nagar_id,nikay,gp_id,gram_id,ward_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [user_unique_id,username,mobile, dob, email, gender, is_department,add,deplist,desig,depadd,depidproof,pubid,district,blocknagar,nikay,gp,gram,ward]);
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

