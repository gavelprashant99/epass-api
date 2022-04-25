const connection = require("../config/mysqldb");
const crypto = require("crypto");
const request = require("request");
const express = require("express");
const { validationResult } = require("express-validator");
// const jwt = require("jsonwebtoken");
const encToken = '5d41402abc4b2a76b9719d911017c592';
const decToken = 'thr538ndtrofa6oysqnelxo6a4i4z5o9';
const aadharOperations = [];



aadharOperations["aadharAuth"] = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({
      errors: errors.array(),
      response_status: 400,
    });
  }

  let txn = Date.now(); // use current timestamp and store it to match with response key => CTS;
  let headers = { "Req_Data": aesEncryption(req.body.aadhar_no + '|' + req.body.name + '|' + txn + '|AUA-CJS', encToken) };
  let url = "http://testpehchan.cgstate.gov.in:8082/RestAdv/auth/WebService/getAuthStatus";
  try {
    let apiResponse = await callPostAPI(url, headers);
    let decryptedData = JSON.parse(aesDecryption(apiResponse, decToken));
    if (decryptedData.hasOwnProperty("AuthRes") && decryptedData.AuthRes === "y") {
      let txn = Date.now();
      headers = {"Req_Data": aesEncryption(req.body.aadhar_no + '|OTP|01|' + txn + "pmg" + '|AUA-CJS', encToken)};
      url = "http://testpehchan.cgstate.gov.in:8082/RestAdv/auth/WebService/generateOtp";
      await sqlFunction("INSERT INTO aadhar_otp (`txn`) VALUES (?)", [txn]);

      let apiResponse = await callPostAPI(url, headers);
      apiResponse = aesDecryption(apiResponse, decToken).split(",");
      res.json({"txn": apiResponse[11].trim()});

    } else if (decryptedData.hasOwnProperty("AuthRes") && decryptedData.AuthRes === "n") {
      res.json({ "Aadhar": "Invalid Name Provided" });
    } else if (decryptedData.hasOwnProperty("AuthRes") && decryptedData.AuthRes === "E-12") {
      res.json({ "Aadhar": "Invalid Number Provided" });
    } else {
      res.json(decryptedData);
    }
  } catch (err) {
    console.log("Error =========>", err);
    res.json({ "Error": err })
  }
};

aadharOperations["aadherOTPVerify"] = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({
      errors: errors.array(),
      response_status: 400,
    });
  }
  let aadharNumber = req.body.aadhar_no;
  let otp = req.body.otp;
  let txn = req.body.txn;
  headers = {"Req_Data": aesEncryption(aadharNumber + '|OTP|' + otp + '|' + txn + '|AUA-CJS', encToken)};
  url = "http://testpehchan.cgstate.gov.in:8082/RestAdv/auth/WebService/verifyOtp";
  try{
    let apiResponse = await callPostAPI(url, headers);
      apiResponse = JSON.parse(aesDecryption(apiResponse, decToken));
      res.json({"is_valid": apiResponse.AuthRes});
  }catch (err) {
    res.json({ "Error": err });
  }
};
aadharOperations["aadherOperation"] = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({
      errors: errors.array(),
      response_status: 400,
    });
  }
  let operation = req.params.operation;
  let aadharNumber = req.query.aadhar_no;
  let txn = Date.now();
  let headers = {"Req_Data": aesEncryption('A|' + aadharNumber + '|0|' + txn + "pmg" + '|AUA-CJS', encToken)};
  if (operation === "advtoAdh") {
      let user_id = req.query.user_id;
      let result = await sqlFunction("SELECT ref,txn FROM aadhar_ref WHERE user_id = ?",[user_id]);
      headers = {"Req_Data": aesEncryption('B|' + result[0].ref +"|"+ result[0].txn + 'pmg|AUA-CJS', encToken)};
  }

  try {
      let response = {"msg":"", status:200};
      let url = "http://testpehchan.cgstate.gov.in:8082/RestAdv/auth/WebService/" + operation;
      let apiResponse = await callPostAPI(url, headers);
      apiResponse = aesDecryption(apiResponse, decToken).split("|");
      if (operation === "adhtoAdv" && apiResponse.length===4) {
          await sqlFunction("INSERT INTO `aadhar_ref`(`user_id`, `ref`,`txn`) VALUES (?,?,?)", ['1', apiResponse[0] + "|" + apiResponse[1], apiResponse[3]]);
          res.json(response.msg = "Operation successful");
      }
      res.json(response.msg = apiResponse);
  } catch (err) {
      res.json({"Error: ": err})
  }
};


function aesEncryption(data, key) {
  let algorithm = "aes-256-cbc";
  let initVector = "0000000000000000";
  let cipher = crypto.createCipheriv(algorithm, key, initVector);
  let encryptedData = cipher.update(data, "utf-8", "base64");
  encryptedData += cipher.final("base64");
  return encryptedData;
}

function aesDecryption(data, key) {
  let algorithm = "aes-256-cbc";
  let initVector = "0000000000000000";
  let decipher = crypto.createDecipheriv(algorithm, key, initVector);
  let decryptedData = decipher.update(data, "base64", "utf-8");
  decryptedData += decipher.final("utf-8");
  return decryptedData;
}

function callPostAPI(url, headers) {
  return new Promise((resolve, reject) => {
    request.post({
      headers: headers,
      url: url
    }, function (error, response, body) {
      if (!error) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}


function sqlFunction($sql, $params = []) {
  return new Promise((resolve, reject) => {
    connection.query($sql, $params, function (error, results) {
      if (error) {
        reject(error);
      } else {
        resolve(results === undefined ? [] : results);
      }
    });
  });
}

module.exports = aadharOperations;