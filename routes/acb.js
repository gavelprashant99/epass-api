const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
// const auth = require("../middleware/auth");
const operations = require("../controllers/acb.controller");

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// const maxSize = 200 * 1024 ; // 200 KB

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        // let uploadPath = "./upload_files";  // for local 
           let uploadPath = "./acb_upload_files"; // for server
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        let file_path = uploadPath + "/" + "pdf_files";
        if (file.fieldname == "video_file") {
            file_path = uploadPath + "/" + "video_files";
        }
        else if (file.fieldname == "audio_file") {
            file_path = uploadPath + "/" + "audio_files";
        }else if(file.fieldname == "res_file"){
            file_path = uploadPath + "/" + "resolution_files";
        }
        if (!fs.existsSync(file_path)) {
            fs.mkdirSync(file_path);
        }
        cb(null, file_path);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({
    storage: storage,
    // limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        // Set the filetypes, it is optional
        // console.log("----------");
        // console.log(file);
        var filetypes = /pdf/;
        if (file.fieldname == "video_file") {
            filetypes = /mov|mp4|avi|wmv/;
        }
        else if (file.fieldname == "audio_file") {
            filetypes = /m4a|aac|mpeg|mp3/;
        }
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error("File upload only supports the "
            + "following filetypes - " + filetypes), false);
    }
});


/**
 * @method - POST
 * @description - ACB Complaint registration
 * @url - /acb/add_acb
 */
var cpUpload = upload.fields([{ name: 'pdf_file', maxCount: 1 }, {
    name: 'video_file',
    maxCount: 1
}, { name: 'audio_file', maxCount: 1 }]);

router.post("/add_acb_complaint", cpUpload, async (req, res) => {
    const file = req.files;
    let flag = false;
    if (file.pdf_file == undefined) {
        if(file.video_file[0].path!="")
            fs.unlinkSync("./" + file.video_file[0].path);
        if(file.audio_file[0].path!="")
            fs.unlinkSync("./" + file.audio_file[0].path);
        res.send({ message: "कृपया पीडीएफ फाइल अपलोड करें", response_status: 400 });
    }
    else if (file.video_file == undefined && file.audio_file == undefined) {
        if(file.video_file[0].path!="")
            fs.unlinkSync("./" + file.pdf_file[0].path);
        res.send({ message: "कृपया विडियो या ऑडियो फाइल अपलोड करें", response_status: 400 });

    }
    else {
        let msg = ""
        if (file.pdf_file[0].size > 5 * 1024 * 1024) {
            flag = true;
            fs.unlinkSync("./" + file.pdf_file[0].path);
        }
        if (file.video_file != undefined && file.video_file[0].size > 25 * 1024 * 1024) {
            flag = true;
            fs.unlinkSync("./" + file.video_file[0].path);
        }
        if (file.audio_file != undefined && file.audio_file[0].size > 10 * 1024 * 1024) {
            flag = true;
            fs.unlinkSync("./" + file.audio_file[0].path);
        }
        if (flag) {
            res.send({ message: "पीडीएफ 5MB, विडियो 25MB और ऑडियो फाइल 10MB तक का ही होना चाहिए", response_status: 400 });
        }
        else {
            operations['insert_acb_complaint'](req, res, file);
            // res.send({ message: "Testing"});
        }
    }
});

/**
 * @method - GET
 * @description -GET ACB Complaint 
 * @url - /acb/get_acb_complaint
 */
router.get("/get_acb_complaint/:status?",async (req, res) => {
    operations['fetch_acb_complaint_data'](req, res);
});

router.get("/getDashbaordCount",async (req, res) => {
    operations['getDashboardCounts'](req, res);
});
/**
 * @method - GET
 * @description -GET ACB Complaint files 
 * @url - /acb/get_acb_complaint_files
 */
 router.get("/get_acb_complaint_files/:comp_id?",[
    check("comp_id", "Please enter complaint id")
    .not()
    .isEmpty(),
],async (req, res) => {
    operations['fetch_acb_complaint_files'](req, res);
});

/**
 * @method - GET
 * @description -GET fetch_file? 
 * @url - /acb/fetch_file
 */
router.get("/fetch_file", async (req, res) => {
    res.download(req.query.file_url);
});
/**
 * @method - POST
 * @description -POST ACB Complaint Resolution 
 * @url - /acb/updateResolution
 */
 var ResUpload = upload.fields([{ name: 'res_file', maxCount: 1 }]);

router.post("/updateResolution/",ResUpload,[
    check("comp_id", "Please enter complaint id")
    .not()
    .isEmpty(),
    check("resolution_remark", "Please enter resolution remarks").not().isEmpty(),
    check("status", "Please enter a status").not().isEmpty()
],async (req, res) => {
    const file = req.files;
    console.log("here is something", file);
    let flag = false;
    if (file != undefined) {

        console.log("Yes I am here ");
        let msg = ""
        if (file.res_file[0].size > 200 * 1024 ) {
            flag = true;
            fs.unlinkSync("./" + file.res_file[0].path);
        }
        if (flag) {
            return res.send({ message: "पीडीएफ 200KB तक का ही होना चाहिए", response_status: 400 });
        }
        // res.send({ message: "कृपया पीडीएफ फाइल अपलोड करें", response_status: 400 });
    }else{
        let file = [];
    }
    operations['updateResolution'](req, res,file);
   
});

router.post("/acbComplaintForward/",[
    check("comp_id", "Please enter complaint id")
    .not()
    .isEmpty()
],async (req, res) => {
    //console.log("=========",req.body);
    operations['acbComplaintForward'](req, res);
   
});
module.exports = router;