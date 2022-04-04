const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
// const auth = require("../middleware/auth");
const operations = require("../controllers/acb.controller");


/**
 * @method - POST
 * @description - ACB Complaint registration
 * @url - /acb/add_acb
 */

 router.post("/add_acb_complaint", [
    check("district_id", "Please Select A District")
        .not()
        .isEmpty(),
], async (req, res) => {
    console.log(req.body);
    operations['insert_acb_complaint'](req, res);
});

module.exports = router;