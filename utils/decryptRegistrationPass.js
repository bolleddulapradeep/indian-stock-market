const bcrypt = require("bcrypt");
const User = require("../models/users");
const decryptRegistrationPass = async (req, res, next) => {
  try {
    var data = await User.findOne({username: req.body.username,isDeleted: false,});
      if (data) {
          bcrypt.compare(req.body.password, data.password, function (error,result) {
              console.log(req.body.password, data.password, result);
              if (!result) {
                  return res.status(500).json({ status: false, message: "please provide the vaild crds" });
              }
              next();
          });
      } else {
          res.status(500).json({status: false,message: "Unable to find the User, Please try With the valid username",});
      }
  } catch (error) {
    return res.status(500).json({status: false,message: "Unable to find the details, Please try Later",});
  }
};

module.exports = decryptRegistrationPass;
