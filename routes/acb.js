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
        let uploadPath = "./upload_files";
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }
        let file_path = uploadPath+"/"+"pdf_files";
        if(file.fieldname=="video_file"){
            file_path = uploadPath+"/"+"video_files";
        }
        else if(file.fieldname=="audio_file"){
            file_path = uploadPath+"/"+"audio_files";
        }
        if (!fs.existsSync(file_path)){
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
    fileFilter: function (req, file, cb){
        // Set the filetypes, it is optional
        // console.log("----------");
        // console.log(file);
        var filetypes = /pdf/;
        if(file.fieldname=="video_file"){
            filetypes = /mov|mp4|avi|wmv/;
        }
        else if(file.fieldname=="audio_file"){
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
 var cpUpload = upload.fields([{ name: 'pdf_file', maxCount: 1 }, { name: 'video_file', 
 maxCount: 1}, { name:'audio_file', maxCount: 1}]);

router.post("/add_acb_complaint",cpUpload, async (req, res) => {
    const file = req.files;
    let flag = false;
    if(file.pdf_file==undefined){
        res.send({ message: "कृपया पीडीएफ फाइल अपलोड करें", response_status: 400 });
    }
    else if(file.video_file==undefined && file.audio_file==undefined)
    {
        res.send({ message: "कृपया विडियो या ऑडियो फाइल अपलोड करें", response_status: 400 });
    }
    else{
        let msg = "" 
        if(file.pdf_file[0].size> 5*1024*1024){
            flag = true;
            fs.unlinkSync("./"+file.pdf_file[0].path);
        }
        if(file.video_file!= undefined && file.video_file[0].size> 25*1024*1024){
            flag = true;
            fs.unlinkSync("./"+file.video_file[0].path);
        }
        if(file.audio_file!= undefined && file.audio_file[0].size> 10*1024*1024){
            flag = true;   
            fs.unlinkSync("./"+file.audio_file[0].path);
        }
        if(flag)
        {
            res.send({ message: "पीडीएफ 5MB, विडियो 25MB और ऑडियो फाइल 10MB तक का ही होना चाहिए", response_status: 400 });
        }
        else{
            operations['insert_acb_complaint'](req, res, file);
            // res.send({ message: "Testing"});
        }
    }
});

module.exports = router;