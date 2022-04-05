const connection = require("../config/mysqldb");
const express = require("express");
const router = express.Router();
const {check, validationResult} = require("express-validator");
const acdOperations = [];

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

let returnData;
let sql;

// Insert ACB

acdOperations['insert_acb_complaint'] = async (req, res, file) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    
    let {
        applicant_name, applicant_mobile, applicant_email, department_id, district_id, nikay, 
        block_nagar_id, date_of_event, time_of_event, place_of_event, accused_designation, accused_department, latitude, longitute, 
        created_by
    } = req.body;
    let created_ip = req.ip;    
    try {
        sql = `SELECT count(1)+1 AS autoId FROM tbl_complaint_acb`;
        let returnData_autoId = await sqlFunction(sql);
        let generatedComplaintId = "C" + department_id + returnData_autoId[0].autoId.toString().padStart("8", "0");
        
        let comp_id = generatedComplaintId

        sql = `INSERT INTO tbl_complaint_acb(comp_id, applicant_name, applicant_mobile, applicant_email,department_id, district_id, nikay, 
            block_nagar_id, date_of_event, time_of_event, place_of_event, accused_designation, accused_department, latitude, longitute, 
            created_by, created_ip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        returnData = await sqlFunction(sql,[comp_id, applicant_name, applicant_mobile, applicant_email, department_id, district_id, nikay, 
            block_nagar_id, date_of_event, time_of_event, place_of_event, accused_designation, accused_department, latitude, longitute, 
            created_by, created_ip]);
        if (returnData.affectedRows != undefined && returnData.affectedRows > 0){

            sql = `INSERT INTO tbl_file_upload_acb(original_file_name, file_type, uploaded_file_name, file_url,file_size,fk_complaint_id,ip_address) 
                VALUES (?,?,?,?,?,?,?)`;
            if(file.pdf_file!==undefined)
            {
                await sqlFunction(sql, [file.pdf_file[0].originalname, file.pdf_file[0].mimetype, file.pdf_file[0].filename, file.pdf_file[0].path, 
                    file.pdf_file[0].size,comp_id,created_ip])
            }
            if(file.video_file!==undefined)
            {
                await sqlFunction(sql, [file.video_file[0].originalname, file.video_file[0].mimetype, file.video_file[0].filename, file.video_file[0].path,
                    file.video_file[0].size,comp_id,created_ip])
            }
            if(file.audio_file!==undefined)
            {
                await sqlFunction(sql, [file.audio_file[0].originalname, file.audio_file[0].mimetype, file.audio_file[0].filename, file.audio_file[0].path, 
                    file.audio_file[0].size,comp_id,created_ip])
            }

            res.send({
                message: "Complain added successfully",
                response_status: 200,
            });
        }
        else res.send({ message: "Error", response_status: 400 });
    } catch (e) {
        console.log(e);
        res.send({message: "Error in inserting Data"});
    }
};


module.exports = acdOperations;