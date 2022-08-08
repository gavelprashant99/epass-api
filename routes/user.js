const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

//step 3


router.post("/schlorship", [
    check("mno", "Please enter a valid Mobile Number")
        .not()
        .isEmpty()
        .isLength({
            min:10,
            max:10
        }),
    check("uname", "Please enter a valid user name")
        .not()
        .isEmpty()
        .isString(),
    check("fname", "Please enter a valid father name")
        .not()
        .isEmpty()
        .isString(),
    check("aadhar", "Please enter a valid Aadhar")
        .not()
        .isEmpty()
        .isLength({
            min: 12,
            max: 12
        }),
    check("gender", "Please enter a valid gender")
        .not()
        .isEmpty()
        .isString(),
    check("dob", "Please enter a valid DOB")
        .not()
        .isEmpty(),
    check("doa", "Please enter a valid Date of admission")
        .not()
        .isEmpty(),
    check("add", "Please enter a valid address")
        .not()
        .isEmpty()
], async (req, res) => {
    console.log(res.body);
    const operations = require("../controllers/user.controller");
    operations['scholarship'](req, res);
});



router.post("/pension", [
    check("mno", "Please enter a valid Mobile Number")
        .not()
        .isEmpty()
        .isLength({
            min:10,
            max:10
        }),
    check("uname", "Please enter a valid user name")
        .not()
        .isEmpty()
        .isString(),
    check("fname", "Please enter a valid father name")
        .not()
        .isEmpty()
        .isString(),
    check("aadhar", "Please enter a valid Aadhar")
        .not()
        .isEmpty()
        .isLength({
            min: 12,
            max: 12
        }),
    check("gender", "Please enter a valid gender")
        .not()
        .isEmpty()
        .isString(),
    check("dob", "Please enter a valid DOB")
        .not()
        .isEmpty(),
    check("dor", "Please enter a valid Date of admission")
        .not()
        .isEmpty(),
    check("add", "Please enter a valid address")
        .not()
        .isEmpty()
], async (req, res) => {
    console.log(res.body);
    const operations = require("../controllers/user.controller");
    operations['pension'](req, res);
});
/**
 * @method - POST
 * @url - /user/login
 * @description - User Login using SHA512
 */

//step 4
router.post("/check", [
    check("aadhar", "Please enter a valid aadhar number")
        .not()
        .isEmpty()
        .isLength({
            min: 12,
            max: 12
        }),
    check("scheme", "Please enter a valid scheme id")
        .not()
        .isEmpty()
], async (req, res) => {
    const operations = require("../controllers/user.controller");
    operations['checkAadhar'](req, res);
});


router.get("/getSrnDetails/:aadhar",[
    check("aadhar", "Please enter a valid aadhar number")
        .not()
        .isEmpty()
        .isLength({
            min: 12,
            max: 12
        })
], async(req, res)=>{
    const operations = require("../controllers/user.controller");
    operations['getSrnDetails'](req, res);
})

router.get("/storeAadhar",[], async(req, res)=>{
    const operations = require("../controllers/user.controller");
    operations['storeAadharData'](req, res);
})

router.get("/checkMe",[], async(req, res)=>{
    const operations = require("../controllers/user.controller");
    operations['checkMe'](req, res);
})

router.get("/master",[], async(req, res)=>{
    const operations = require("../controllers/user.controller");
    operations['master'](req, res);
})



module.exports = router;
