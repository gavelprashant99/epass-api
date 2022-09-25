const express = require("express");
const router = express.Router();
const operations = [];
operations['encrykey'] = "20220723";
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


operations['originsWhitelist'] = [
    'http://localhost:4400',
    'http://localhost:4600',
    'http://localhost:4200',     //this is my front-end url for development
    'http://localhost:4300',     //this is my admin panel url for development
  ];
module.exports = operations;
