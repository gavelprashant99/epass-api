// const connection = require("../config/mysqldb");
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
  try{
    let apiResponse = await callPostAPI(url, headers);
    let decryptedData = JSON.parse(aesDecryption(apiResponse, decToken));
    if (decryptedData.hasOwnProperty("AuthRes") && decryptedData.AuthRes === "y") {
        res.json({"Aadhar": "Valid"});
    } else if (decryptedData.hasOwnProperty("AuthRes") && decryptedData.AuthRes === "n") {
        res.json({"Aadhar": "Invalid Name Provided"});
    } else if (decryptedData.hasOwnProperty("AuthRes") && decryptedData.AuthRes === "E-12") {
        res.json({"Aadhar": "Invalid Number Provided"});
    } else {
        res.json(decryptedData);
    }
  }catch(err){
    res.json({"Error":err})
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

module.exports = aadharOperations;