const jwt = require("jsonwebtoken");
const connection = require("../config/mysqldb");

function sqlFunction($sql, $params = []) {
  return new Promise((resolve, reject) => {
    connection.query($sql, $params, function (error, results) {
      if (error) {
        reject(error);
      } else {
        resolve(results == undefined ? [] : results);
      }
    });
  });
}


module.exports = async function(req, res, next) {



  console.log("here is something",req.method);
  const token = req.header("token");
  if (!token) return res.status(401).json({ message: "Auth Error" });
  try {
    const decoded = jwt.verify(token, "secret");
    console.log("Here is the decoded data",decoded);
    req.user = decoded.user;
    sql = 'SELECT COUNT(1) valid FROM tbl_admin ta WHERE ta.mobile = ? AND ta.role = ? AND ta.`status` = ? ';
    returnData = await sqlFunction(sql, [decoded.user.mobile,decoded.user.role, 'A']);
      console.log("Here is the results", returnData);
    if(returnData[0].valid)
      next();
    else 
      res.status(400).send({ message: "Invalid User" });
  } catch (e) {
    console.error(e);
    res.status(401).send({ message: "Invalid Token" });
  }
};