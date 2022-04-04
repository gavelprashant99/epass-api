const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const operations = require("../controllers/department.controller");
// const auth = require("../middleware/auth");

/**
* @method - POST
* @description - Post 
* @url - /department/resolution_update
*/

router.post("/resolution_update", [
    check("complaint_id", "Please enter a valid complaint_id")
        .not()
        .isEmpty(),
    check("user_id", "Please enter a valid resolver user id")
        .not()
        .isEmpty(),
    check("comment", "Please enter a valid comment")
        .not()
        .isEmpty(),
    check("resolution_datetime", "Please enter a valid resolution_datetime")
        .not()
        .isEmpty(),
    check("closure_date", "Please enter a valid closure_date")
        .not()
        .isEmpty(),
    check("ip_address", "Please enter a valid ip address")
        .not()
        .isEmpty()    
], async (req, res) => {
    operations['resolution_update'](req, res);
});

/**
* @method - POST
* @description - Post 
* @url - /department/timelimit_update
*/

router.post("/timelimit_update", [
    check("complaint_id", "Please enter a valid complaint id")
        .not()
        .isEmpty(),
    check("user_id", "Please enter a valid resolver user id")
        .not()
        .isEmpty(),
    check("comment", "Please enter a valid comment"),
    check("timelimit_date", "Please enter a valid timelimit date")
        .not()
        .isEmpty(),
    check("ip_address", "Please enter a valid ip address")
        .not()
        .isEmpty()    
], async (req, res) => {
    operations['timelimit_update'](req, res);
});

router.post('/reassign_complaint',[
    check("complaint_id", "Please enter a valid complaint id")
        .not()
        .isEmpty(),
    check("user_id", "Please enter a valid resolver user id")
        .not()
        .isEmpty(),
    check("comment", "Please enter a valid comment")
        .not()
        .isEmpty(),
    check("dept_id", "Please enter a valid department id")
        .not()
        .isEmpty(),
    check("ip_address", "Please enter a valid ip address")
        .not()
        .isEmpty()    
] ,async (req, res) => {
    operations['reassign_complaint'](req, res);
});

module.exports = router;
