const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.post("/userRegistration", [
    check("u_name", "Please enter your name")
        .not()
        .isEmpty(),
    check("mobile", "Please enter your mobile number")
        .not()
        .isEmpty(),
    check("dob", "Please enter a valid DOB")
        .not()
        .isEmpty(),
    check("email", "Please enter a valid email")
        .not()
        .isEmpty(),
    check("gender", "Please enter a valid gender")
        .not()
        .isEmpty(),
    check("is_department", "Please enter the department flag")
        .not()
        .isEmpty()
], async (req, res) => {
    const operations = require("../controllers/epass.controller");
    operations['userRegistration'](req, res);
});


module.exports = router;