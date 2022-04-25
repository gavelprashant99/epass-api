const connection = require("../config/mysqldb");
const express = require("express");
const router = express.Router();
const {check, validationResult} = require("express-validator");
const acbOperations = [];
const fs = require("fs");

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

acbOperations['insert_acb_complaint'] = async (req, res, file) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    let applicant_data = JSON.parse(req.body.data);
    let latitude= req.body.latitude;
    let longitute =req.body.longitute;
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
            accused_department, latitude, longitute, 
            applicant_data.created_by, created_ip, applicant_data.nnn_type, gp_ward_id, gram_id, applicant_data.officer_name,'P']);
            if (returnData.affectedRows != undefined && returnData.affectedRows > 0){
            
                sql = `INSERT INTO tbl_complaint_ledger_acb(comp_id, from_officer, to_officer, district_id, block_nagar_id, status, 
                    remark, created_by, created_ip) VALUES (?,?,?,?,?,?,?,?,?)`;
                returnData = await sqlFunction(sql,[comp_id, 'C','ACB0300', applicant_data.district_id,
                block_nagar_id, 'P','ACB - Complaint Initiated', applicant_data.created_by, created_ip]);
                if (returnData.affectedRows != undefined && returnData.affectedRows > 0){
                    sql = `INSERT INTO tbl_file_upload_acb(original_file_name, file_type, uploaded_file_name, file_url,file_size,fk_complaint_id,ip_address, file_category) 
                    VALUES (?,?,?,?,?,?,?,?)`;
                if(file.pdf_file!==undefined)
                {
                    await sqlFunction(sql, [file.pdf_file[0].originalname, file.pdf_file[0].mimetype, file.pdf_file[0].filename, file.pdf_file[0].path, 
                        file.pdf_file[0].size,comp_id,created_ip,"D"])
                }
                if(file.video_file!==undefined)
                {
                    await sqlFunction(sql, [file.video_file[0].originalname, file.video_file[0].mimetype, file.video_file[0].filename, file.video_file[0].path,
                        file.video_file[0].size,comp_id,created_ip,"V"])
                }
                if(file.audio_file!==undefined)
                {
                    await sqlFunction(sql, [file.audio_file[0].originalname, file.audio_file[0].mimetype, file.audio_file[0].filename, file.audio_file[0].path, 
                        file.audio_file[0].size,comp_id,created_ip,"A"])
                }
                // let sms = util.sms(mobile_no, 3, "1307164805510256873", "आपकी शिकायत दर्ज की जा चुकी  है, आपका शिकायत क्रमांक " + generatedComplaintId + " हैं | जनशिकायत छत्तीसगढ़, चिप्स");
                res.send({ message: "आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है।  आपकी शिकायत आईडी : " + generatedComplaintId, complaint_id: generatedComplaintId, response_status: 200 });
                }else{
                 return res.send({ message: "Error In Ledger", response_status: 400 });   
                }            
            }
        else res.send({ message: "Error", response_status: 400 });
    } catch (e) {
        console.log(e);
        res.send({message: "Error in inserting Data"});
    }
};

acbOperations['fetch_acb_complaint_data'] = async (req, res) => {
    let status = req.params.status == undefined ? "" : req.params.status;
    let condition = "";
    if(status!=""){
        condition =" WHERE c.app_status =?";
    }
    try{
        sql =`SELECT c.comp_id, c.applicant_name , c.applicant_mobile , c.applicant_email, c.created_on complaint_date,
            c.nikay, c.date_of_event , c.time_of_event, c.place_of_event, c.accused_officer_name, 
            c.app_status, d.dept_name_hi, d.dept_name_eng, md.District_Name distNameHin, md.DBStart_Name_En district_name_eng, 
            n.block_nagar_name, n.block_nagar_name_eng 
            FROM tbl_complaint_acb c 
            INNER JOIN master_departments d ON c.accused_department = d.dept_id 
            INNER JOIN master_districts md ON c.district_id =  md.LGD_CODE 
            INNER JOIN temp_nagar_block n ON c.block_nagar_id = n.block_nagar_code `+condition;
        returnData = await sqlFunction(sql, [status]);
        res.send({ "data":returnData,"response_status": 200});

    }catch (e) {
        console.log(e);
        res.send({message: "Error in fetching Data", response_status: 400 });
    }
};

acbOperations['getDashboardCounts'] = async (req, res) => {
    try{
        sql = `SELECT tl.status, COUNT(1) acount  FROM tbl_complaint_ledger_acb tl 
        WHERE tl.is_active = 1
        GROUP BY tl.status
        UNION ALL
        SELECT 'total',COUNT(1) acount FROM tbl_complaint_ledger_acb tl
        WHERE tl.is_active = 1 `
        returnData = await sqlFunction(sql, []);
        res.send({ "data":returnData,"response_status": 200});

    }catch (e) {
        console.log(e);
        res.send({message: "Error in fetching Data", response_status: 400 });
    }
};

acbOperations['fetch_acb_complaint_files'] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    try{
        let comp_id = req.params.comp_id == undefined ? "" : req.params.comp_id;
        sql="SELECT f.original_file_name, f.uploaded_file_name, f.file_url, f.file_category FROM tbl_file_upload_acb f WHERE f.fk_complaint_id =?";
        returnData = await sqlFunction(sql, [comp_id]);
        res.send({ "data":returnData,"response_status": 200});

    }catch (e) {
        console.log(e);

    }
};
acbOperations['updateResolution'] = async (req, res, file) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
   
    let comp_id= req.body.comp_id;
    let resolution_remark =req.body.resolution_remark;
    let status =req.body.status;
    let resolution_datetime = new Date();
    let resolved_by = req.body.resolved_by != undefined ? req.body.resolved_by : "API";
    let ip_address = req.socket.remoteAddress;

    try {
        sql = `SELECT tc.comp_id,md.dept_name_hi,tc.department_id,tc.applicant_mobile
        FROM tbl_complaint_acb tc
        LEFT JOIN master_departments md ON md.dept_id = tc.department_id
        WHERE tc.comp_id = ? and tc.app_status NOT IN (?)  
		ORDER BY id DESC LIMIT 1`;
        returnData = await sqlFunction(sql,[comp_id,'C']);
        if(returnData.length==0){
            res.send({ message: "Complaint id dose not exist OR Its Already Closed","response_status": 404});
        }else{
            sql = `SELECT tc.from_officer, tc.to_officer, tc.district_id, tc.block_nagar_id, tc.status, tc.remark FROM tbl_complaint_ledger_acb tc
            WHERE tc.comp_id = ? AND tc.is_active = ? AND tc.status != ?`;
            compData = await sqlFunction(sql, [comp_id,1,'C']);
             if(compData.length==0){
              return res.send({ message: "complaint id not active","response_status": 400});
            }

            sql = "UPDATE tbl_complaint_ledger_acb lg SET lg.is_active = 0 WHERE lg.comp_id = ? AND lg.status != 'C'";
            returnData = await sqlFunction(sql, [comp_id]);
            if (returnData.affectedRows == undefined || returnData.affectedRows <= 0) {
                console.log("status not updated in ledger");
            }
            sql = `INSERT INTO tbl_complaint_ledger_acb(comp_id, from_officer,to_officer,district_id, block_nagar_id,remark,is_active,status,created_ip) 
            VALUES (?,?,?,?,?,?,?,?,?)`;
            returnData = await sqlFunction(sql, [comp_id, resolved_by,"",compData[0].district_id, compData[0].block_nagar_id,resolution_remark,1,status,ip_address]);
            if (returnData.affectedRows != undefined && returnData.affectedRows > 0) {
                sql = `UPDATE tbl_complaint_acb ca SET ca.app_status = ? ,ca.resolution_remark = ?
                ,ca.resolution_datetime = ?  ,ca.resolved_by = ? 
                WHERE ca.comp_id = ? AND ca.app_status != ?`;
                returnData = await sqlFunction(sql, [status,resolution_remark,resolution_datetime,resolved_by,comp_id,'C']);
                if (returnData.affectedRows == undefined || returnData.affectedRows <= 0) {
                    console.log("status not updated in complaint table");
                }
                if(file!==undefined){
                  for(let i = 0; i < req.files.res_file.length; i++) {
                    sql = `INSERT INTO tbl_file_upload_acb(original_file_name, file_type, uploaded_file_name, file_url,file_size,fk_complaint_id,is_resolution_file,ip_address) 
                    VALUES (?,?,?,?,?,?,?,?)`;
                    returnData = await sqlFunction(sql, [file.res_file[i].originalname, file.res_file[i].mimetype, file.res_file[i].filename, file.res_file[i].path, file.res_file[i].size,comp_id,1,ip_address]); // 1 - resolution file
                  }
                }
              }else{
                res.send({ message: "Not Inserted In Ledger", response_status: 400 });
              }
              res.send({ message: "Complaint Resolution Successfully Updated", response_status: 200 });
        }  
    } catch (e) {
        console.log(e);
        res.send({message: "Techincal Error"});
    }
};


acbOperations['acbComplaintForward'] = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    let comp_id = req.body.comp_id;
    sql = `SELECT tca.id id ,tca.comp_id compId,tca.applicant_name applicantName,
    tca.applicant_mobile applicantMobile , tca.applicant_email email,
    tca.department_id deptId, tca.cmpt_code cmptCode, tca.cmpt_sub_code
    cmptSubCode, tca.district_id distId, tca.nikay nikay,
    tca.nnn_type nnntype , tca.block_nagar_id blockNagarId, tca.gp_ward_id
    gpWardId,tca.gram_id gramId, tca.date_of_event dateOfEvent,
    tca.time_of_event timeOfEvent , tca.place_of_event placeOfEvent,
    tca.accused_officer_name accusedOfficerName, tca.accused_designation
    accusedDesignation,tca.accused_department accusedDept , tca.app_status
    appStatus
    FROM tbl_complaint_acb tca 
    WHERE tca.comp_id = ? AND tca.app_status NOT IN (?)`;
    returnData = await sqlFunction(sql, [comp_id,'C']);
    console.log("returnData",returnData);
    if(returnData.length <= 0) {
    return res.send({message: "Complaint Id is Invalid Or its closed",response_status: 404});
    }
    let department_id = req.body.dept_id;
    let district_id = returnData[0].distId;
    let applicantName = returnData[0].applicantName;
    let address = returnData[0].nikay;
    let mobile = returnData[0].applicantMobile;
    let subject = "";
    sql = `SELECT md.dept_id deptId,md.dept_name_hi deptNameHin,
    md.dept_name_eng deptNameEng,md.dept_code deptCode,
    md.model model , md.hide hide FROM master_departments md
    WHERE md.dept_id = ?`;
    returnData = await sqlFunction(sql, [department_id]);
    let deptNameEng = '';
    let deptNameHin = '';
    if(returnData.length <= 0) {
        return res.send({message: "Department Id Is Invalid !",response_status: 404});
    }else{
        deptNameEng = returnData[0].deptNameEng;
        deptNameHin = returnData[0].deptNameHin;
    }
    sql = `SELECT tc.from_officer, tc.to_officer, tc.district_id, tc.block_nagar_id, tc.status, tc.remark FROM tbl_complaint_ledger_acb tc
    WHERE tc.comp_id = ? AND tc.is_active = ? AND tc.status != ?`;
    compData = await sqlFunction(sql, [comp_id,1,'C']);
     if(compData.length==0){
      return res.send({ message: "complaint id not active","response_status": 400});
    }
    let to_officer  = compData[0].to_officer;
    let applicant_district_id = compData[0].district_id;
    let block_nagar_id = compData[0].block_nagar_id;
    try{
        let pgn_value = "None";
        sql = "SELECT pgn_id, DBStart_Name_En FROM `master_districts` WHERE LGD_CODE =?";
        returnData = await sqlFunction(sql, [district_id]);
        console.log("returnDataPGN",returnData);
        let pgn_district_id = returnData[0].pgn_id;
        let pgn_district_name = returnData[0].DBStart_Name_En;
        let app_category_id = 6 // for shikayat category
        let app_category_name = 'शिकायत' 
        let isfileuploaded ="N";
        let ip_address = req.socket.remoteAddress;
        let sqlGetFiles = `SELECT tfa.file_id fileId ,tfa.fk_complaint_id compId,
        tfa.original_file_name originalFileName , tfa.uploaded_file_name
        uploadedFileName , tfa.file_type fileType, tfa.file_url fileUrl,
        tfa.file_size fileSize , tfa.created_datetime uploadedDateTime,
        tfa.ip_address ipAddress
        FROM tbl_file_upload_acb tfa  
        WHERE tfa.fk_complaint_id = ? AND 
        is_resolution_file != ? AND tfa.file_category = ?`
        returnData = await sqlFunction(sqlGetFiles, [comp_id,1,'D']) // only post pdf file data yet.
        if(returnData.length > 0){
            isfileuploaded = "Y";
            let fileUrl = returnData[0].fileUrl;
            fileData = fs.readFileSync("./"+fileUrl, 'base64');
        }else{
            console.log("file not found!");
        }
       // console.log("fileData",fileData);
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://janshikayat.cg.nic.in/janshikayatApiStaging/api/Master/SaveComplaintDetails',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"name":applicantName,
            "address": address,
            "subject": subject,
            "applicantdistrictid": pgn_district_id.toString(),
            "appcategoryid": app_category_id.toString(),
            "applicantdistrictname": pgn_district_name,
            "mobileno": mobile.toString(),
            "isfileuploaded": isfileuploaded, "filedata": fileData})

        };
        request(options, async function (error, response) {
            if (error) throw new Error(error);
            else if(JSON.parse(response.body)['status']==true){
                 console.log("pgn response post ",response.body);
                pgn_value = JSON.parse(response.body).value;
                sql="UPDATE tbl_complaint_acb SET is_posted = 1 , pgn_value = ? WHERE comp_id=?";
                returnData = await sqlFunction(sql, [comp_id,pgn_value]);
                if (returnData.affectedRows == undefined && returnData.affectedRows <= 0) {
                    console.log("isposted not updated!");
                }
            }
        });
        let froward_remark = "complaint forwarded to concern detpartment"
        sql = `INSERT INTO tbl_complaint_ledger_acb(comp_id, from_officer,to_officer,district_id, block_nagar_id,remark,is_active,status,created_ip) 
        VALUES (?,?,?,?,?,?,?,?,?)`;
        returnData = await sqlFunction(sql, [comp_id,to_officer,department_id,applicant_district_id,block_nagar_id,froward_remark,1,'F',ip_address]);
        if (returnData.affectedRows != undefined && returnData.affectedRows > 0) {
            let sqlUpdateStatus = `UPDATE tbl_complaint_acb SET app_status = 'F' WHERE comp_id = ?`
            returnData = await sqlFunction(sqlUpdateStatus,['F',comp_id]);
            if(returnData.affectedRows == undefined && returnData.affectedRows<=0){
                return res.send({message: "Error in updating status ! please try again later"});
            }
        }
        res.send({ message: "शिकायत क्रमांक : " +comp_id+ " संबंधित विभाग : "+deptNameHin+ " को सफलतापूर्वक भेजी गयी है", response_status: 200 });
    }catch (e) {
        console.log(e);
        res.send({message: "Technical Error..."});
    }

};

module.exports = acbOperations;