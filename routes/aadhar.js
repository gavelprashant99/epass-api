const express = require("express");
const {check} = require("express-validator");
const router = express.Router();

/**
* @method - POST
* @description - Post 
* @url - /aadhar/aadharAuth
*/


router.post("/aadharAuth", [
    check("aadhar_number", "Please enter a Aadhar no.")
        .not()
        .isEmpty(),
    check("applicantname", "Please enter a applicantname")
        .not()
        .isEmpty()   
], async (req, res) => {
    const operations = require("../controllers/aadhar.controller");
    operations['aadharAuth'](req, res);
});


/**
* @method - POST
* @description - Post 
* @url - /aadhar/aadharAuth
*/
router.post("/aadharVerifyOTP", [
    check("aadhar_number", "Please enter a Aadhar no.")
        .not()
        .isEmpty(),
    check("otp", "Please enter a OTP")
        .not()
        .isEmpty(),
    check("txn", "Please enter a Transection")
        .not()
        .isEmpty()   
], async (req, res) => {
    const operations = require("../controllers/aadhar.controller");
    operations['aadherOTPVerify'](req, res);
});

/**
* @method - POST
* @description - Post 
* @url - /aadhar/aadharAuth
*/
router.post("/uid/:operation", async (req, res) => {
    const operations = require("../controllers/aadhar.controller");
    operations['aadharOperation'](req, res);
});
module.exports = router;