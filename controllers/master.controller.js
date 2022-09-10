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





operations['district'] = async (req, res) =>{
    
    try{
        srn = await sqlFunction(`SELECT * FROM master_district `, []);
        console.log("Here is the srn Number for get ", srn);
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

//villagelist

operations['villagelist'] = async (req, res) =>{
    var blockId = req.params.block_id;
    console.log("Here is the distt id ", blockId);
    try{
        srn = await sqlFunction(`SELECT * FROM master_villages mv 
        INNER JOIN temp_block tb ON tb.district_id = mv.district_id  AND tb.block_id = mv.block_id
        WHERE mv.district_id =44 AND tb.district_id = 44 AND mv.block_id = 2 `, [blockId]);
        console.log("Here is the srn Number for get ", srn);
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

//blocklist

operations['blockList'] = async (req, res) =>{
    var distId = req.params.dist_id;
    console.log("Here is the distt id ", distId);
    try{
        srn = await sqlFunction(`SELECT * FROM temp_block tb
        WHERE tb.district_id = ? AND tb.block_id <127 `, [distId]);
        console.log("Here is the srn Number for get ", srn);
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


operations['nagarList'] = async (req, res) =>{
    var distId = req.params.dist_id;
    console.log("Here is the distt id ", distId);
    try{
        srn = await sqlFunction(`SELECT * FROM temp_block tb
        WHERE tb.district_id = ? AND tb.block_id >127 `, [distId]);
        console.log("Here is the srn Number for get ", srn);
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




operations['villagelist'] = async (req, res) =>{
    var districtId = req.params.dist_id;
    var blockId = req.params.block_id;
    var GpId = req.params.gp;
    console.log("Here is the distt id ", blockId);
    try{
        srn = await sqlFunction(`SELECT mv.vlocation, mv.village_name FROM master_panchayats mp 
        INNER JOIN master_villages mv ON mp.panchayat_code = mv.Std_Panchayat_Code
        WHERE mp.District_ID = ? AND mp.Block_ID = ? AND mp.panchayat_code = ? `, [districtId, blockId, GpId]);
        console.log("Here is the srn Number for get ", srn);
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
        res.json({ "message": "Error in Finding Data"+e, "response_status": 400 });
    }   
}

//panchayatlist

operations['panchaytlist'] = async (req, res) =>{
    var distId = req.params.dist_id;
    var blockId = req.params.block_id;
    console.log("Here is the distt id ", distId);
    try{
        srn = await sqlFunction(`SELECT mp.panchayat_code, mp.panchayat_name_hindi FROM master_panchayats mp
        WHERE mp.District_ID = ? AND mp.Block_ID = ? `, [distId, blockId]);
        console.log("Here is the srn Number for get ", srn);
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

//wardlist

operations['wardlist'] = async (req, res) =>{
    var distId = req.params.dist_id;
    var nagarId = req.params.nagarId;
    console.log("Here is the distt id ", distId, "Nagar : ",nagarId);
    try{
        srn = await sqlFunction(`SELECT mw.Ward_No, mw.Ward_Name FROM master_wards mw
        INNER JOIN master_district md ON mw.Dist_ID = md.district_id
        INNER JOIN master_nagar mn ON mw.Dist_ID = mn.Dist_ID AND mw.NNN_ID = mn.NNN_ID
        WHERE md.district_id = ? AND mn.Std_NNN_Code = ?`, [distId,nagarId]);
        console.log("Here is the srn Number for get ", srn);
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
        res.json({ "message": "Error in Finding Data"+e, "response_status": 400 });
    }   
}

//id proof

operations['idproof'] = async (req, res) =>{
    
    try{
        srn = await sqlFunction(`SELECT id_name FROM master_identity_proof `, []);
        console.log("Here is the srn Number for get ", srn);
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

//department list 

operations['departmentlist'] = async (req, res) =>{
    
    try{
        srn = await sqlFunction(`SELECT dept_name_eng FROM master_department `, []);
        console.log("Here is the srn Number for get ", srn);
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
