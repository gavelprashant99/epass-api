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





operations['tickectList'] = async (req, res) =>{
    
    try{
        srn = await sqlFunction(`SELECT * FROM tbl_ticket`, []);
        if (srn.length > 0) {
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
    }
    catch(e){
        res.json({ "message": "Error in Finding Data", "response_status": 400 });
    }
}

operations['tickectDetails'] = async (req, res) =>{
    
    try{
        srn = await sqlFunction(`SELECT * FROM tbl_ticket WHERE id = ?`, [req.params.ticketId]);
        if (srn.length > 0) {
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
    }
    catch(e){
        res.json({ "message": "Error in Finding Data", "response_status": 400 });
    }
}

operations['ApproveDetails'] = async (req, res) =>{
     var statusshow = req.body.status;
     var ticketid = req.body.ticketId;
    try{
        srn = await sqlFunction(`UPDATE tbl_ticket tt SET tt.pass_status = "?" WHERE tt.id= ?;  `, [statusshow,ticketid]);
        if (srn.length > 0) {
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
    }
    catch(e){
        res.json({ "message": "Error in Finding Data", "response_status": 400 });
    }
}


module.exports = operations;
