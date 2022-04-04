const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
// const auth = require("../middleware/auth");

/**
* @method - POST
* @description - Post 
* @url - /officer/add_officer
*/

router.post("/add_officer", [
    check("fullname", "Please enter full_name").not().isEmpty(),
    check("mobile", "Please enter mobile no.").not().isEmpty().isNumeric().isLength({ min: 10,max:10  }),
    check("district_lgd", "Please select district").not().isEmpty(),
    check("block_nagar_lgd_code", "Please select block or nagar").not().isEmpty(),
    check("dept_id", "Please select department").not().isEmpty(),
    check("designation", "Please enter designation").not().isEmpty(),
    check("status", "Please select status").not().isEmpty(),
    check("role", "Please select role").not().isEmpty(),
    check("created_by", "Please select role").not().isEmpty()    
    ], async (req, res) => {
    const operations = require("../controllers/officer.controller");
    operations['insertOfficer'](req, res);
});


/**
* @method - GET
* @description - Get 
* @url - /officer/officer_list
*/

router.get("/officer_list/:dept?", async (req, res) => {
    const operations = require("../controllers/officer.controller");
    operations['officerList'](req, res);
});

/**
* @method - POST
* @description - Post 
* @url - /officer/officer_map
*/

router.get("/officer_list/:dept?", async (req, res) => {
    const operations = require("../controllers/officer.controller");
    operations['officerList'](req, res);
});

module.exports = router;