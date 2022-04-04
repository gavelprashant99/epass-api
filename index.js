const express = require("express");
cors = require('cors');
var svgCaptcha = require('svg-captcha');
const bodyParser = require("body-parser");

const master =require("./routes/master");
const user =require("./routes/user");
const officer =require("./routes/officer");
const acb = require("./routes/acb");

const whiteList = require("./controllers/util");

const app = express();

var corsOptions = {
  origin: function(origin, callback){
        var isWhitelisted = whiteList.originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true
}
//here is the magic
app.use(cors(corsOptions));

// PORT
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

app.get('/captcha', function (req, res) {
	var captcha = svgCaptcha.create({ charPreset: 'ABCDEFGHLMNPRTWZ2346789',color:false, noise :0, fontSize:60, height:50, width:250, background:"#152e43"});
	res.type('svg');
	res.status(200).send(captcha);
});

/**
 * Router Middleware
 * Router - /user/*
 * Method - *
 */
app.use("/master", master);
app.use("/user", user);
app.use("/officer", officer);
app.use("/acb", acb);

app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});