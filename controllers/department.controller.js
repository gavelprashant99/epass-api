const connection = require("../config/mysqldb");
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const operations = [];


function sqlFunction($sql, $params=[]){
    return new Promise((resolve, reject) => {
        connection.query($sql,$params,function(error,results){
            if(error){
                reject(error);
            }
            else{
                resolve(results==undefined?[]:results);
            }
        });
    });
}

let returnData;
let sql;

//resolution_update
operations['resolution_update'] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(),"response_status": 400
        });
    }
    let complaint_id = req.body.complaint_id;
    let user_id = req.body.user_id;
    let remark = req.body.comment;
    let resolution_datetime = req.body.resolution_datetime;
    let closure_date = req.body.closure_date;
    let ip_address = req.body.ip_address;
  
    try {
        sql= "UPDATE complaints SET resolver_id = ?,remark = ?,resolution_datetime = ?,closure_date = ?,update_ip_address=?,status = ? WHERE complaint_id =?";
        returnData = await sqlFunction(sql, [user_id, remark, resolution_datetime, closure_date,ip_address,'R',complaint_id]); // status R for resolved
        if (returnData.affectedRows!=undefined && returnData.affectedRows>0) {
            res.send({ message: "resolution details updated","response_status": 200});
        }
        else {
            //database error
            res.send({ message: "Error","response_status": 400 });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: "Error in Updating Data","response_status": 400 });
    }
};

//timelimit_update
operations['timelimit_update'] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(),"response_status": 400
        });
    }
    let complaint_id = req.body.complaint_id;
    let user_id = req.body.user_id;
    let remark = req.body.comment;
    let timelimit_date = req.body.timelimit_date;
    let ip_address = req.body.ip_address;
  
    try {
        sql= "UPDATE complaints SET resolver_id = ?,remark = ?,timelimit_date = ?,update_ip_address=?,status=? WHERE complaint_id =?";
        returnData = await sqlFunction(sql, [user_id, remark, timelimit_date,ip_address,'T',complaint_id]); // status T timie limit set.
        if (returnData.affectedRows!=undefined && returnData.affectedRows>0) {
            res.send({ message: "timelimit updated ","response_status": 200});
        }
        else {
            //database error
            res.send({ message: "Error","response_status": 400 });
        }
    } catch (e) {
        console.log(e);
        res.send({ message: "Error in Updating Data","response_status": 400 });
    }
};


operations['reassign_complaint'] = async  (req, res) => {
    const error =  validationResult(req);
    if(!error.isEmpty()){
        return res.status(200).json({
            errors : error.array(),"response_status":400
        });        
    }
    let complaint_id = req.body.complaint_id;
    let user_id = req.body.user_id;
    let remark = req.body.comment;
    let dept_id = req.body.dept_id;
    let update_ip_address = req.body.ip_address;

    try{
        sql = "UPDATE complaints SET status = ?, assigned_from = ?, assigned_to = ?,remarks = ?,ip_address = ? WHERE complaint_id = ?";
        returnData = await sqlFunction(sql, ['F',user_id,dept_id,remark,update_ip_address,complaint_id]);
        if(returnData.affectedRows !=undefined & returnData.affectedRows>0){
            res.send({ message: "1 record reassigned","response_status": 200});
        }else{
            res.send({ message: "Error","response_status": 400});
        }
    }catch(e){
        res.send({ message: "Error in Updating Data","response_status": 400});
    }
}

module.exports = operations;
