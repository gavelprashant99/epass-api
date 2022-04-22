const express = require("express");
const {check} = require("express-validator");
const router = express.Router();

/**
* @method - POST
* @description - Post 
* @url - /aadhar/aadharAuth
*/


router.post("/aadharAuth", [
    check("aadhar_no", "Please enter a Aadhar no.")
        .not()
        .isEmpty(),
    check("name", "Please enter a Name")
        .not()
        .isEmpty()   
], async (req, res) => {
    const operations = require("../controllers/aadhar.controller");
    operations['aadharAuth'](req, res);
});

module.exports = router;