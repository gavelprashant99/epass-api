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
    check("block_id","please enter block" )
         .not()
         .isEmpty(),
    check("nagar_id","please select nagar ")
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


router.get("/pendingTickets",[], async(req, res)=>{
    const operations = require("../controllers/epass.controller");
    operations['pendingTickets'](req,res);
});

router.post("/generateTicket", [
    check("ticket_id","ticket number")
    .not()
    .isEmpty(),
    check("request_date","please enter a requested date")
    .not()
    .isEmpty(),
    check("request_time","please enter a requested time")
    .not()
    .isEmpty(),
    check("request_by","please enter requested by")
    .not()
    .isEmpty(),
    check("mobile_no","enter mobile number")
    .not()
    .isEmpty(),
    check("request_dept","enter requested department")
    .not()
    .isEmpty(),
    check("room_no","enter room number")
    .not()
    .isEmpty(),
    check("reason","enter reason")
    .not()
    .isEmpty(),
    check("identity_type","enter identity type")
    .not()
    .isEmpty(),
    check("scanned_on","enter scanned on ")
    .not()
    .isEmpty(),
    check("scanned_by","enter scanned by")
    .not()
    .isEmpty(),
    check("pass_type","enter pass type")
    .not()
    .isEmpty(),
    check("latitude","latitude")
    .not()
    .isEmpty(),
    check("longitude","longitude")
    .not()
    .isEmpty(),

], async (req, res) => {
    const operations = require("../controllers/epass.controller");
    operations['generateTicket'](req, res);
});
    



module.exports = router;