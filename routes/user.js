const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
// const auth = require("../middleware/auth");
const connection = require("../config/mysqldb");
const sha = require('js-sha512');


/**
* @method - POST
* @description - Post 
* @url - /user/otp_genrate
*/

//step 1
router.post("/otp_generate/:cond?", [
    check("mobileno", "Please enter a valid Mobile Number")
        .isNumeric()
        .isLength({
            min: 10,
            max:10 
        })
], async (req, res) => {
    const operations = require("../controllers/user.controller");
    operations['sign_otp_generate'](req, res);
});

/**
* @method - POST
* @description - Post 
* @url - /user/otp_verify
*/

//step 2
router.post("/otp_verify", [
    check("mobileno", "Please enter a valid Mobile Number")
        .isNumeric()
        .isLength({
            min: 10,
            max:10 
        }),
    check("otp", "Please enter a otp")
        .isNumeric()
        .isLength({
            min: 6,
            max:6 
        })
], async (req, res) => {
    const operations = require("../controllers/user.controller");
    operations['signup_otp_verify'](req, res);
});


/**
* @method - POST
* @description - Post 
* @url - /user/signup
*/

//step 3
router.post("/signup", [
    check("mobileno", "Please enter a valid Mobile Number")
        .not()
        .isEmpty(),
    check("password", "Please enter a valid password")
        .not()
        .isEmpty()
        .isLength({
            min: 6
        })
], async (req, res) => {
    const operations = require("../controllers/user.controller");
    operations['usersignup'](req, res);
});

/**
 * @method - POST
 * @url - /user/login
 * @description - User Login using SHA512
 */

//step 4
router.post("/login", [
    check("user_id", "Please enter a valid User Id (mobile no)")
        .isLength({
            min: 10,
            max:10 
        }),
    check("password", "Please enter a valid password")
        .isLength({
            min: 6
        })
], async (req, res) => {
    const operations = require("../controllers/user.controller");
    operations['userlogin'](req, res);
});


module.exports = router;
