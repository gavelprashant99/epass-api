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

acdOperations['insert_acb_complaint'] = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "status": 400
        });
    }
    let {
        applicant_name, applicant_mobile, department_id, district_id, nikay, 
        block_nagar_id, date_of_event, time_of_event, place_of_event, accused_designation, accused_department, latitude, longitute, 
        created_by
    } = req.body;
    let created_ip = req.ip;    
    try {
        // var storage = multer.diskStorage({
        //     destination: function (req, file, cb) {
        //         let uploadPath = "./upload_files";
        //         if (!fs.existsSync(uploadPath)){
        //         fs.mkdirSync(uploadPath);
        //         }
        //         cb(null, uploadPath);
        //     },
        //     filename: function (req, file, cb) {
        //         cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        //     },
        // });
        // const storage = multer.diskStorage({
        //     destination: "./upload_files",
        //     filename: function(req, file, cb){
        //       crypto.randomBytes(20, (err, buf) => {
        //         cb(null, buf.toString("hex") + path.extname(file.originalname))
        //       })
        //     }
        //   });
        // const upload = multer({
        //     storage: storage
        // }).fields([{name: "pdf_file"}, {name: "video_file"},{name:"audio_file"}]);
        
        // upload(req, res, (err) => {
        //     if (err) throw err;
        // });

        sql = `SELECT count(1)+1 AS autoId FROM tbl_complaint_acb`;
        let returnData_autoId = await sqlFunction(sql);
        let generatedComplaintId = "C" + department_id + returnData_autoId[0].autoId.toString().padStart("8", "0");
        
        let comp_id = generatedComplaintId

        sql = `INSERT INTO tbl_complaint_acb(comp_id, applicant_name, applicant_mobile, department_id, district_id, nikay, 
            block_nagar_id, date_of_event, time_of_event, place_of_event, accused_designation, accused_department, latitude, longitute, 
            created_by, created_ip) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        returnData = await sqlFunction(sql,[comp_id, applicant_name, applicant_mobile, department_id, district_id, nikay, 
            block_nagar_id, date_of_event, time_of_event, place_of_event, accused_designation, accused_department, latitude, longitute, 
            created_by, created_ip]);
        if (returnData.affectedRows != undefined && returnData.affectedRows > 0){
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