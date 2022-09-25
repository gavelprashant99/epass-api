const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");



router.get("/ticket-list",[], async(req, res)=>{
    const operations = require("../controllers/admin.controller");
    operations['tickectList'](req,res);
})

router.get("/ticket-details/:ticketId",[], async(req, res)=>{
    const operations = require("../controllers/admin.controller");
    operations['tickectDetails'](req,res);
})

router.get("/ApproveDetails/:ticketId/:status",[], async(req, res)=>{
    const operations = require("../controllers/admin.controller");
    operations['ApproveDetails'](req,res);
})

module.exports = router;
