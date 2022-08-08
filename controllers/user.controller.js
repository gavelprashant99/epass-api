const connection = require("../config/mysqldb");
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const Encryption = require('node_triple_des');

// const auth = require("../middleware/auth");

const operations = [];
const sha = require('js-sha512');
const util = require("./util");

function sqlFunction($sql, $params = []) {
    return new Promise((resolve, reject) => {
        connection.connection.query($sql, $params, function (error, results) {
            if (error) {
                reject(error);
            }
            else {
                resolve(results == undefined ? [] : results);
            }
        });
    });
}

function sqlFunctionAadhar($sql, $params = []) {
    return new Promise((resolve, reject) => {
        connection.connectionaadhar.query($sql, $params, function (error, results) {
            if (error) {
                reject(error);
            }
            else {
                resolve(results == undefined ? [] : results);
            }
        });
    });
}

function numberToChar(number){
    let str =  number.split('')
    const code = 'A'.charCodeAt(0);
    let reference = [];
    str.forEach(element => {
        reference.push(String.fromCharCode(code + parseInt(element)))
    });
   return reference.join('');    
}

async function getReference(hased_aadhar){
    returnRefe = await sqlFunctionAadhar(`SELECT ad.r_key FROM aadhar_data ad WHERE ad.aadhar_hash = ?`, [hased_aadhar.toString()]);
    console.log("Reference ",returnRefe);
    if(returnRefe.length>0)
    return returnRefe[0].r_key;
    else 
    return 0;
}

async function getSrn(reference){

    srn = await sqlFunction(`SELECT ud.srn FROM user_data ud WHERE ud.reference_no = ?;`, [reference.toString()]);
    //console.log("SRN : " +srn.length+ " | Reference : "+reference);
    //console.log("------------------------------------------------");
    //console.log(srn.length);
    if(srn.length>0)
    return srn[0].srn;
    else 
    return 0;
}



async function setSrn(uname, mno, dob, fname, address, gender, aadhar){
    let reference = await getReference(aadhar);
    //console.log("Yes I am calling _______ : "+aadhar);
    if(reference != 0 ){
        srn = numberToChar((new Date().getTime() -1650011223344).toString());
        sqlUser = " INSERT INTO user_data(uname, mobile, dob, fname, address, gender, srn, reference_no) VALUES (?,?,?,?,?,?,?,?)";
        returnData = await sqlFunction(sqlUser, [uname, mno, dob, fname, address, gender, srn, reference]);
        if(returnData.affectedRows > 1)
        return srn;
        
    } 
    return 0;
    
}

async function setReference(aadhar,uname, fname, mno, dob){

    console.log("Aadhar data", aadhar);

    let reference = numberToChar(new Date().getTime().toString());
    let salt_pass_first = util.encrykey + aadhar + util.encrykey;
    console.log( " aadhar data with key "+salt_pass_first);
    let mask = "XXXX-XXXX-X"+aadhar.toString().substr(aadhar.toString().length - 3);
    let hased_aadhar = sha(salt_pass_first);

    let enc = Encryption.encrypt("+$JKI$+0JFJ%##@7~R~$#@GDGggfsdg8Qop", Encryption.encrypt("!~#52148/*fds*&$JIUYGdfasd897er%#R##@op", Encryption.encrypt("@#$%^&*^^-TGHUY(*&^%$%^&*(", aadhar.toString())));
    
    returnDataAadhar = await sqlFunctionAadhar(`SELECT ad.r_key FROM aadhar_data ad WHERE ad.aadhar_hash = ?;`, [hased_aadhar.toString()]);
    //console.log("fkasdfklfkldsflsaklfsd",returnDataAadhar);
    if(returnDataAadhar.length  == 0){
        sqlHash = " INSERT INTO aadhar_data (r_key, mobile_number, aadhar_mask, aadhar_hash) VALUES (?,?,?,?)";
        returnAadharData = await sqlFunctionAadhar(sqlHash, [reference, mno, mask, hased_aadhar]);
        //Encryption
        sqlEnc = " INSERT INTO aadhar_encoded (aadhar_no, cname, fname, dob, mobile_no, r_key) VALUES (?,?,?,?,?,?)";
        returnAadharEncode = await sqlFunctionAadhar(sqlEnc, [enc, uname, fname, dob, mno, reference]);
        if(returnAadharData.length > 0 && returnAadharEncode.length > 0 ){
            //console.log("I am from Set Reference - Success", returnAadharData);
            return reference;
        }
        else {
            //console.log("I am from Set Reference - Fail", returnAadharData);
            return 0;
        }
    }
    return 0    
}

//step 1
let returnData;
let sql;

//step 3
operations['scholarship'] = async (req, res) => {

    ////console.log("Here is the request", req);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "response_status": 400
        });
    }
    
    let mno = req.body.mno;
    let aadhar = req.body.aadhar;
    let uname = req.body.uname.trim();
    let fname = req.body.fname.trim();
    let gender = req.body.gender;
    let dob = req.body.dob;
    let doa = req.body.doa;
    let add = req.body.add.trim();
    let enrollment_no = req.body.enroll.trim();
    let is_gov = req.body.gov;

    try {
        console.log("Here is the aadhar ", aadhar);
        let salt_pass_first = util.encrykey + aadhar + util.encrykey;
        console.log("Here is the salt_pass_first ", salt_pass_first);
        let hased_aadhar = sha(salt_pass_first);
        console.log("hash key ",hased_aadhar );
        let reference = await getReference(hased_aadhar);
        let srn = await getSrn(reference);

        console.log("Reference : "+ reference + " SRN "+ srn);
        if(reference != 0 && srn == 0){   
            srn = await setSrn(uname, mno, dob, fname, add, gender, hased_aadhar);;
        }
        if(reference == 0 && srn == 0){   
            //console.log("-2- aadhar data ", aadhar);
            reference = await setReference(aadhar,uname, fname, mno, dob);
            srn = await setSrn(uname, mno, dob, fname, add, gender, hased_aadhar);
        }
       reference = await getReference(hased_aadhar);
       srn = await getSrn(reference);
        sqlScheme = `INSERT INTO department_scholarship (uname, mobile_number, father_name, gender, 
            address, enrollment_no, dob, adminsion_date, is_gov, reference_no, srn) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
        returnData = await sqlFunction(sqlScheme, [uname, mno, fname, gender, add, enrollment_no, dob, doa, is_gov, reference, srn]);
        if(returnData.affectedRows > 0)
            res.send({ message: " Your SRN is: " +srn, data:returnData, "response_status": 200});
        else 
            res.send({message:"Duplicate Entry For SRN : " + srn, response_status:202})
           
    } catch (e) {
        //console.log(e);
        res.send({ message: "Error in Inserting Data - " + e.sqlMessage, "response_status": 400 });
    }
};

operations['pension'] = async (req, res) => {

    ////console.log("Here is the request", req);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.array(), "response_status": 400
        });
    }
    
    let mno = req.body.mno;
    let aadhar = req.body.aadhar;
    let uname = req.body.uname.trim();
    let fname = req.body.fname.trim();
    let gender = req.body.gender;
    let dob = req.body.dob;
    let dor = req.body.dor;
    let add = req.body.add.trim();
    let pension_no = req.body.pno.trim();
    

    try {
        let salt_pass_first = util.encrykey + aadhar + util.encrykey;
        let hased_aadhar = sha(salt_pass_first);

        let reference = await getReference(hased_aadhar);
        let srn = await getSrn(reference);
        ////console.log("Reference : "+ reference + " SRN "+ srn);
        if(reference != 0 && srn == 0){   
            srn = await setSrn(uname, mno, dob, fname, add, gender, hased_aadhar);;
        }
        if(reference == 0 && srn == 0){   
            //console.log("-2- aadhar data ", aadhar);
            reference = await setReference(aadhar,uname, fname, mno, dob);
            srn = await setSrn(uname, mno, dob, fname, add, gender, hased_aadhar);
        }
       reference = await getReference(hased_aadhar);
       srn = await getSrn(reference);
        sqlScheme = `INSERT INTO department_pension (uname, mobile_number, father_name, gender,
            address, pension_no, dob, retirement_date, reference_no, srn) values (?,?,?,?,?,?,?,?,?,?)`;
        returnData = await sqlFunction(sqlScheme, [uname, mno, fname, gender, add, pension_no, dob, dor, reference, srn]);
        if(returnData.affectedRows > 0)
            res.send({ message: " Your SRN is: " +srn, data:returnData, "response_status": 200});
        else 
            res.send({message:"Duplicate Entry For SRN : " + srn, response_status:202})
           
    } catch (e) {
        //console.log(e);
        res.send({ message: "Error in Inserting Data - " + e.sqlMessage, "response_status": 400 });
    }
};
//step 4

operations['getSrnDetails'] = async (req, res) =>{
    let aadhar = req.params.aadhar;
    //console.log("HEre is the aadhar", aadhar);
    let salt_pass_first = util.encrykey + aadhar + util.encrykey;
    //console.log("Here is the aadhar with key : ", salt_pass_first);
    let hased_aadhar = sha(salt_pass_first);
    //console.log("Here is the aadhar with hash : ", hased_aadhar);
    let reference = await getReference(hased_aadhar);
    //console.log("Reference No : ",reference);
    try{
        srn = await sqlFunction(`SELECT * FROM user_data ud WHERE ud.reference_no = ?`, [reference.toString()]);
        console.log("Here is the srn Number for get ", srn);
        if (srn.length > 0) {
            res.json({
                data:srn[0],
                status:200,
                message:"Data Fatched Successfully"
            })
        }
        else{
            res.json({              
                status:400,
                message:"No Data Found"
            })
        }
    }
    catch(e){
        res.json({ "message": "Error in Finding Data", "response_status": 400 });
    }
    
}

operations['storeAadharData'] = async(req, res) =>{
    try{
        srn = await sqlFunction(`SELECT * FROM records_aadhar ud`, []);
        count = 1;
        if(srn.length > 0 ){
            srn.forEach((element,i) => {
                setTimeout(function(){
                    console.log("sdfasdf ", element);
                    let reference = numberToChar(new Date().getTime().toString());
                    let salt_pass_first = util.encrykey + element.aadhar + util.encrykey;
                    let mask = "XXXX-XXXX-X"+element.aadhar.toString().substr(element.aadhar.toString().length - 3);
                    let hased_aadhar = sha(salt_pass_first);
                    let enc = Encryption.encrypt("+$JKI$+0JFJ%##@7~R~$#@GDGggfsdg8Qop", Encryption.encrypt("!~#52148/*fds*&$JIUYGdfasd897er%#R##@op", Encryption.encrypt("@#$%^&*^^-TGHUY(*&^%$%^&*(", element.aadhar.toString())));
                    console.log("fasdfads asfdsa ",hased_aadhar)
                        sqlVerify = "";
                        sqlHash = " INSERT INTO aadhar_data (r_key, mobile_number, aadhar_mask, aadhar_hash) VALUES (?,?,?,?)";
                        returnAadharData =  sqlFunctionAadhar(sqlHash, [reference, element.mobile, mask, hased_aadhar]);
                        sqlEnc = " INSERT INTO aadhar_encoded (aadhar_no, cname, fname, dob, mobile_no, r_key) VALUES (?,?,?,?,?,?)";
                        returnAadharEncode =  sqlFunctionAadhar(sqlEnc, [enc, element.cname, element.fname, element.dob, element.mobile, reference]);
                        srn = numberToChar((new Date().getTime() -1650011223344).toString());
                        sqlUser = " INSERT INTO user_data(uname, mobile, dob, fname, address, gender, srn, reference_no) VALUES (?,?,?,?,?,?,?,?)";
                        returnData = sqlFunction(sqlUser, [element.cname, element.mobile, element.dob, element.fname, element.address, element.gender, srn, reference]);
                },100);

            });

        }
        
        res.json({              
            status:400,
            message:"No Data Found"+count,
            data:srn
        })
    }
    catch(e){
        console.log("Error ",e);
    }
}

// checkME
operations['checkMe'] = async (req, res) =>{
    
    try{
        srn = await sqlFunction(`SELECT * FROM master_district`, []);
        console.log("Here is the srn Number for get ", srn);
        if (srn.length > 0) {
            res.json({
                data:srn,
                status:200,
                message:"Data Fatched Successfully"
            })
        }
        else{
            res.json({              
                status:400,
                message:"No Data Found"
            })
        }
    }
    catch(e){
        res.json({ "message": "Error in Finding Data", "response_status": 400 });
    }
    
}

// Master





module.exports = operations;
