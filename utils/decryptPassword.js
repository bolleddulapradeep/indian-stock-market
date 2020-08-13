const bcrypt = require("bcrypt");
const User = require("../models/users");
const decryptPassword = async (req, res, next) => {
  try {
    var data = await User.findOne({ username: req.body.username });
    if (data.isDeleted === false) {
       bcrypt.compare(req.body.reset_password, data.reset_password, function (error,result) {
         if (!result) {
           return res.status(500).json({ status: false, message: "Please provide the vaild crds" });
         }
         next();
       });
    } else if(data.isDeleted){ 
        return res.status(200).json({status:false, message:'The User got deleted'})
    }else {
      return res.status(500).json({ status: false, message: "please provide the vaild crds" });
    }
   } catch (error) {
    return res.status(500).json({status: false,message: "Unable to find the details, Please try Later",});
  }
};

module.exports = decryptPassword;
