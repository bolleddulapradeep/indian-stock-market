var JWT = require('jsonwebtoken');
var User = require('../models/users');
const isAuthenticated = (req, res, next) => {
  if (req.headers.authorization) {
    JWT.verify(
      req.headers.authorization.replace("Bearer ", ""),
      "tokenGenerated",
      async (err, tokenUserData) => {
        if (err) {
          return res.status(403).json({ status: false, message:"Please provide the Vaild Token"});
        }
        req.user = tokenUserData;
        try { 
          var data = await User.findOne({ username: req.user.username });
          if (data.isDeleted !== true) {
             next()
          } else if (data.isDeleted === true) {
             return res.status(500).json({ status: false, message: 'The User has deleted' });
          } else {
            return res.status(500).json({ status: false, message: 'JWT Token is Expired... Please Login' });
          }
        } catch (error) {
          return res.status(500).json({ status: false, message: 'JWT Token is Expired... Please Login' });
        }
      });
  } else {
     res.status(500).json({ status: false, message: 'Please Provide the JWT Token' });
  }
}
module.exports = isAuthenticated;