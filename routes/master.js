const express = require("express");
const {check, validationResult} = require("express-validator");
const operations = require("../controllers/master.controller");
// const connection = require("../config/mysqldb");
const router = express.Router();
// const auth = require("../middleware/auth");

/**
 * @method - GET
 * @description - Get All Districts
 * @url - /master/districts
 */

router.get("/districts", async (req, res) => {
    // const operations = require("../controllers/master.controller");
    operations['get_districts'](req, res);
});


/**
 * @method - GET
 * @description - Get All Blocks for a particular districts
 Get Panchayats for a particular Blocks
 * @url - /master/blocks
 */

router.get("/blocks/:distt_lgd_code?/:block_lgd_code?/:std_panchayat_code?", [
    check("distt_lgd_code", "Please Select A District")
        .not()
        .isEmpty(),
], async (req, res) => {
    // const operations = require("../controllers/master.controller");
    operations['get_blocks_panchayat_gram'](req, res);
});

/**
 * @method - GET
 * @description - Get All nagars for a particular districts
 Get wards for a particular nagars
 * @url - /master/nagars
 */

router.get("/nagars/:distt_lgd_code?/:nnn_type?/:std_town_code?/:ward_no?", [
    check("distt_lgd_code", "Please Select A District")
        .not()
        .isEmpty(),
], async (req, res) => {
    // const operations = require("../controllers/master.controller");
    operations['get_nagar_ward_colony'](req, res);
});

router.get("/departments", async (req, res) => {
    // const operations = require("../controllers/master.controller");
    operations['get_departments'](req, res);
});

router.get("/get-complaint-types/:dept_id/:comp_category_code?", async (req, res) => {
    // const operations = require("../controllers/master.controller");
    //operations['get_master_complaint_types'](req, res);
    res.json(await operations['get_master_complaint_types'](req, res));
    /*console.log("getcomp" + complaints);
    let returnData = [];
    for(let i=0; i<complaints.length; i++){
        let obj = {
            "complaint_type": complaints[i].complaint_type,
            "complaint_type_hindi": complaints[i].complaint_type_hindi,
            "complaint_code": complaints[i].cmpt_code,
            "complaint_category": complaints[i].complaint_category,
            "complaint_sub_type": await operations["get_master_complaint_sub_types"](req, res, complaints[i].complaint_type,complaints[i].complain_category_code)
        };
        returnData.push(obj);
    }
    res.json(returnData);*/
});

/**
 * @method - GET (specially for revenue department requirements)
 * @description - Get tehsil for a particular districts or all tehsil without district lgd
 * @url - /master/nagars
 */

router.get("/tehsil/:distt_lgd_code?", [
], async (req, res) => {
    // const operations = require("../controllers/master.controller");
    operations['get_tehsil_by_district'](req, res);
});

/**
 * @method - GET (specially for revenue department requirements)
 * @description - Get village for a particular thesil or all villages without tehsil 
 * @url - /master/nagars
 */

router.get("/village/:subdist_code?", [
], async (req, res) => {
    // const operations = require("../controllers/master.controller");
    operations['get_village_by_tehsil'](req, res);
});
module.exports = router;
