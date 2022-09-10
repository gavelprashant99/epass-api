const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.post("/userRegistration", [
    check("u_name", "Please enter your name")
        .not()
        .isEmpty(),
    check("user_id", "show user id ")
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
    check("gender", "Please select  gender")
        .not()
        .isEmpty(),
    check("is_department", "please select a user type")
        .not()
        .isEmpty(),
    check("dep_list", "Please select the department ")
        .not()
        .isEmpty(),
    check("Designation", "please enter a designation")
        .not()
        .isEmpty(),
    check("dep_address", "please enter a department address")
        .not()
        .isEmpty(),
    check("dep_id_proof", "please upload you departmental id prrof")
        .not()
        .isEmpty(),
    check("pub_add", "please enter a address")
        .not()
        .isEmpty(),
    check("pub_id", "enter id proof")
        .not()
        .isEmpty(),  
         
    check("district_id", "Please select a valid district ")
        .not()
        .isEmpty(),
    check("block_nagar_id", "Please select a valid block nagar")
        .not()
        .isEmpty(),
    check("nikay", "Please select a valid nikay")
        .not()
        .isEmpty(),
    check("gp_id", "Please select a valid gp")
        .not()
        .isEmpty(),

    check("gram_id", "Please select a valid gram")
        .not()
        .isEmpty(),
    check("ward_id", "Please select a valid ward")
        .not()
        .isEmpty(),

    ], async (req, res) => {
    const operations = require("../controllers/epass.controller");
    operations['userRegistration'](req, res);
});


module.exports = router;