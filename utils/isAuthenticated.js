var JWT = require('jsonwebtoken');
var User = require('../models/users');
const isAuthenticated = (req, res, next) => {
  if (req.headers.authorization) {
    JWT.verify(
      req.headers.authorization.replace("Bearer ", ""),
      "tokenGenerated",
      (err, tokenUserData) => {
        if (err) {
          return res.status(403).json({ status: false, message:"Please provide the Vaild Token"});
        }
        
        //req.body = tokenUserData;
        req.user = tokenUserData;
        //req.body.username = req.user.username;
        //console.log(req.user)
        User.findOne({ username: req.user.username }).exec().then(data => {
          if (data) {
            next();
          } else {
            return res.status(500).json({ status: false, message: 'JWT Token is Expired... Please Login' });
          }
        }).catch(error => {
          res.status(500).json({ status: false, message: 'Please Provide the JWT Token' });
        });
      });
  } else {
     res.status(500).json({ status: false, message: 'Please Provide the JWT Token' });
  }
}
module.exports = isAuthenticated;