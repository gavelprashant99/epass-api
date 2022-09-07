const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");



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




router.get("/district",[], async(req, res)=>{
    const operations = require("../controllers/master.controller");
    operations['district'](req,res);
})

router.get("/masterdistrict",[], async(req, res)=>{
    const operations = require("../controllers/master.controller");
    operations['masterdistrict'](req,res);
})

router.get("/block/:dist_id?",[], async(req, res)=>{
    const operations = require("../controllers/master.controller");
    operations['blockList'](req, res);
})
 
router.get("/nagar/:dist_id?",[], async(req, res)=>{
    const operations = require("../controllers/master.controller");
    operations['nagarList'](req, res);
})

router.get("/village/:dist_id?/:block_id?/:gp?",[], async(req, res)=>{
    const operations = require("../controllers/master.controller");
    operations['villagelist'](req, res);
})

router.get("/gp/:dist_id?/:block_id?",[], async(req, res)=>{
    const operations = require("../controllers/master.controller");
    operations['panchaytlist'](req, res);
})

router.get("/wd/:dist_id?/:nagarId?",[], async(req, res)=>{
    const operations = require("../controllers/master.controller");
    operations['wardlist'](req, res);
})
router.get("/departments",[], async(req, res)=>{
    const operations = require("../controllers/master.controller");
    operations['departments'](req,res);
})

module.exports = router;
