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
    
    // let {
    //     applicant_name, applicant_mobile, applicant_email, department_id, district_id, nikay, 
    //     block, date_of_event, time_of_event, place_of_event, accused_designation, latitude, longitute, 
    //     created_by, nnn_type,nagar_nigam, ward, grampanchayat, village, officer_name
    // } = req.body;
    let applicant_data = JSON.parse(req.body.data);

    let created_ip = req.ip; 

    let block_nagar_id = applicant_data.block!=""?applicant_data.block:applicant_data.nagar_nigam;
    let gp_ward_id = applicant_data.grampanchayat!=""?applicant_data.grampanchayat:applicant_data.ward;
    let gram_id = applicant_data.village!=""?applicant_data.village:0;

    let accused_department = applicant_data.department_id;

    try {
        sql = `SELECT count(1)+1 AS autoId FROM tbl_complaint_acb`;
        let returnData_autoId = await sqlFunction(sql);
        let generatedComplaintId = "C" + accused_department + returnData_autoId[0].autoId.toString().padStart("8", "0");
        
        let comp_id = generatedComplaintId

        sql = `INSERT INTO tbl_complaint_acb(comp_id, applicant_name, applicant_mobile, applicant_email, district_id, nikay, 
            block_nagar_id, date_of_event, time_of_event, place_of_event, accused_designation, accused_department, latitude, longitute, 
            created_by, created_ip, nnn_type,gp_ward_id,gram_id, accused_officer_name,app_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        returnData = await sqlFunction(sql,[comp_id, applicant_data.applicant_name, applicant_data.applicant_mobile, applicant_data.applicant_email,
            applicant_data.district_id, applicant_data.nikay, block_nagar_id, applicant_data.date_of_event, applicant_data.time_of_event,
            applicant_data.place_of_event, applicant_data.accused_designation,
            accused_department, applicant_data.latitude, applicant_data.longitute, 
            applicant_data.created_by, created_ip, applicant_data.nnn_type, gp_ward_id, gram_id, applicant_data.officer_name,'P']);
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
            // let sms = util.sms(mobile_no, 3, "1307164805510256873", "आपकी शिकायत दर्ज की जा चुकी  है, आपका शिकायत क्रमांक " + generatedComplaintId + " हैं | जनशिकायत छत्तीसगढ़, चिप्स");
            res.send({ message: "आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है।  आपकी शिकायत आईडी : " + generatedComplaintId, complaint_id: generatedComplaintId, response_status: 200 });
        }
        else res.send({ message: "Error", response_status: 400 });
    } catch (e) {
        console.log(e);
        res.send({message: "Error in inserting Data"});
    }
};


module.exports = acdOperations;