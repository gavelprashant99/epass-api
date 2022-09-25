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
        let is_department = req.body.passtyperadio;
        let deplist = req.body.publicadd;
        let desig = req.body.designation;
        let depadd = req.body.depaddress;
        let add = req.body.pubaddress;
        let depidproof = req.body.depid;
        let pubid = req.body.idproof;
        let user_unique_id = new Date().getTime();
        let district = req.body.District;
        let nikay = req.body.nikayradio;
        let blocknagar = req.body.block_id;
        let nagar = req.body.nagar_id;
        let gp = req.body.gp_id;
        let  gram = req.body.village_id;
        let  ward = req.body.Ward;
       


        userInsertion = await sqlFunction(`INSERT INTO tbl_user_details
        (user_id,u_name, mobile, dob, email, gender, is_department,dep_list,Designation,dep_address,dep_id_proof,pub_add,pub_id,district_id,block_id,block_nagar_id,nikay,gp_id,gram_id,ward_id)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [user_unique_id,username,mobile, dob, email, gender, is_department,deplist,desig,depadd,depidproof,add,pubid,district,blocknagar,nagar,nikay,gp,gram,ward]);
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
 operations['pendingTickets'] = async (req, res)=>{
    try{
        pendingTickets = await sqlFunction(`SELECT tt.ticket_id, tu.u_name, tu.mobile, 
        mdd.district_name, mp.id_name, 
        md.dept_name_hindi, tt.request_date, tt.request_time, tt.room_no FROM tbl_ticket tt
        INNER JOIN tbl_user_details tu ON tt.request_by = tu.user_id
        INNER JOIN master_department md ON tt.request_dept = md.dept_code
        INNER JOIN master_district mdd ON tu.district_id = mdd.district_id
        INNER JOIN master_identity_proof mp ON tt.identity_type = mp.id
        WHERE tt.request_date = CURDATE() AND tt.scanned_on IS NULL AND tt.permitted IS NULL ;        
         `, []);
        console.log("Here is the srn Number for get ", pendingTickets);
        if (pendingTickets.length > 0) {
            res.json({
                data:pendingTickets,
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


operations['generateTicket'] = async (req,res) =>{
    try{

        let ticketid = (Math.random()*100000)+1;
        let reqdate = req.body.date;
        let reqtime = req.body.timel;
        let reqby = req.body.reqby;
        let mobileno = req.body.Number;
        let reqdepartment = req.body.RDepartment;
        let roomno = req.body.RoomNo;
        let reson = req.body.Reason;
        let idtype = req.body.identitytype;
        let scannon = req.body.scanon;
        let scanby = req.body.scanby;
        let passtype = req.body.passtype;

       
        userInsertion = await sqlFunction( `INSERT INTO tbl_ticket
        (ticket_id,request_date,request_time,request_by,mobile_no,request_dept,room_no,reason,identity_type,scanned_on,scanned_by,pass_type)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [ticketid,reqdate,reqtime,reqby,mobileno,reqdepartment,roomno,reson,idtype,scannon,scanby,passtype]);

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
    }
    catch(e){
        res.json({ "message": "Error in Finding Data" + e, "response_status": 400 });
    }
}

module.exports = operations;

