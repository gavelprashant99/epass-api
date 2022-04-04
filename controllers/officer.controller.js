const connection = require("../config/mysqldb");
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const officerOperations = [];
const sha = require("js-sha512");
const util = require("./util");


function sqlFunction($sql, $params = []) {
    return new Promise((resolve, reject) => {
        connection.query($sql, $params, function (error, results) {
        if (error) {
            reject(error);
        } else {
            resolve(results == undefined ? [] : results);
        }
        });
    });
}

officerOperations["insertOfficer"] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        errors: errors.array(),
        response_status: 400,
      });
    }
    let {
        fullname,
        mobile,
        district_lgd,
        block_nagar_lgd_code,
        dept_id,designation,status,
        role,created_by
    } = req.body;
    let ip_address = req.ip;
    try {

      sqlC = "SELECT mobile FROM `tbl_admin` WHERE mobile=?";
      let check = await sqlFunction(sqlC,mobile); 
      if(check.length>0){
        res.send({
          message: "Officer already added",
          response_status: 400,
        });
      }
      else{
        // dept_code = dept_code.length==1?0+dept_code:dept_code;
        /**Get Auto Increment Id */
        sql = `SELECT AUTO_INCREMENT AS autoId FROM  INFORMATION_SCHEMA.TABLES WHERE  TABLE_NAME  = ?;`
        let returnData_autoId = await sqlFunction(sql,["tbl_admin"]); 

        let user_id = "A"+returnData_autoId[0].autoId.toString().padStart(6,"0");

        sql = sql ="INSERT INTO `tbl_admin`(`user_id`, `fullname`, `mobile`, `dept_id`, `designation`, `role`, `status`,`created_by`,`created_ip`) "
          +"VALUES (?,?,?,?,?,?,?,?,?)";
        returnData = await sqlFunction(sql, [ user_id,
          fullname,
          mobile,dept_id,
          designation,role,status,created_by,ip_address
        ]);
    
        if (returnData.affectedRows != undefined && returnData.affectedRows > 0){
          sql="INSERT INTO `tbl_admin_map`(`district_id`, `block_id`, `current_officer_id`,`created_by`, `created_ip`)"
            +" VALUES (?,?,?,?,?)";
          returnData = await sqlFunction(sql, [ district_lgd,block_nagar_lgd_code,user_id,created_by,ip_address]);
          res.send({
            message: "Officer added successfully",
            response_status: 200,
          });
        }
        else res.send({ message: "Error", response_status: 400 });
      }
    } catch (e) {
      console.log(e);
      res.json({ message: "Error in adding", response_status: 400 });
    }
};
officerOperations["officerList"] = async (req, res) => {
  try {
    let dept = req.params.dept == undefined ? 0 : req.params.dept;
    let condition="";
    if(dept>0){
      condition = "WHERE dept_id = "+dept;
    }
    return new Promise((resolve, reject) => {
        let sql = "SELECT  `user_id`, `fullname`, `mobile`, `dept_id`, `designation`, `role`, `status` "
        +"FROM tbl_admin "+condition;
        connection.query(sql, function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(res.json(result));
            }
        });
    });
} catch (e) {
    console.log(e);
    res.send({message: "Error in Fetching Data"});
}
};
module.exports = officerOperations;