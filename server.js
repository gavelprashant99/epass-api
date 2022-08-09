const express = require("express");
cors = require('cors');
var svgCaptcha = require('svg-captcha');
const bodyParser = require("body-parser");
const master=require("./routes/master");
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
const PORT = process.env.PORT || 4001;

// Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "API is Working" });
});

app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});

app.use("/master", master);
