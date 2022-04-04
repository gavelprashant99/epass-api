const express = require("express");
cors = require('cors');
var svgCaptcha = require('svg-captcha');
const bodyParser = require("body-parser");

var multer = require('multer');
var forms = multer();
const path = require('path');
const fs = require('fs');


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
app.use(forms.array()); 

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

app.get('/captcha', function (req, res) {
	var captcha = svgCaptcha.create({ charPreset: 'ABCDEFGHLMNPRTWZ2346789',color:false, noise :0, fontSize:60, height:50, width:250, background:"#152e43"});
	res.type('svg');
	res.status(200).send(captcha);
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "./upload_files";
    if (!fs.existsSync(uploadPath)){
      // console.log("------------>")
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const maxSize = 200 * 1024 ; // 200 KB
    
var upload = multer({ 
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb){
    // Set the filetypes, it is optional
    var filetypes = /jpeg|jpg|png|pdf/;
    var mimetype = filetypes.test(file.mimetype);
    // console.log(req.headers['content-length']);
    const uploadSize = parseInt(req.headers['content-length']);
    var extname = filetypes.test(path.extname(
      file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    } 
    return cb(new Error("File upload only supports the "
    + "following filetypes - " + filetypes), false);
  } 
});

app.post("/upload",upload.single('pdffiles'), function(req, res, next) {
  console.log(9);
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