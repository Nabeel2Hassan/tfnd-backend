const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // console.log("token is ", req.headers.token);
    const decoded = jwt.verify(req.headers.token, process.env.secretKey);
    req.decodedToken = decoded;
    req.user = decoded; // as i need user info in token
    next();
  } catch (error) {
    return res.status(401).json("Auth Failed");
  }
};
