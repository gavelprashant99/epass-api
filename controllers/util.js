const express = require("express");
const router = express.Router();
const operations = [];
operations['encrykey'] = "7x!A%D*F-JaNdRgU";
operations['randomString'] = (length, chars) => {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
};

operations['sms'] = async (mobileno,smsType,templateId, massage)=>{
    var request = require('request');
    var res = [];
    var options = {
        'method': 'POST',
        'url': 'https://sms.cgstate.gov.in/SendSMS',
        'headers': {
            'access-key': 'SMSBuildnxt@123'
        },
        formData: {
            'mobile': mobileno,
            'username': 'CGCHIPS-JANSHIKAYAT', 
            'password': 'janshikayat2022@123',
            'smsType': smsType,
            'templateId': templateId,
            'message': massage
        }
    };
    // CGCHIPS-CMFLG , CGCHIPS-QDC  // cgqdc@12345 , Chips@12345
    return new Promise(function(resolve, reject){
        request(options, function (error, response) {
        if (error) throw error;
            // console.log(response.body);
            res = JSON.parse(response.body);
            if(res['status']==200){
                resolve(res["status"]);
            }else{
                reject("OTP not sent");
            }
        });
        // var sts=200;
        // if(sts==200){
        //     resolve(200);
        // }else{
        //     reject("OTP not sent");
        // }
    });
};

operations['originsWhitelist'] = [
    'http://localhost:4400',
    'http://localhost:4400/',
    'http://localhost:4300'     //this is my front-end url for development
  ];
module.exports = operations;
