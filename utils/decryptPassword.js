const bcrypt = require("bcrypt");
const User = require('../models/users')
const decryptPassword =  (req, res, next) => {
     User.findOne({ username: req.body.username }).exec((error, data) => {
        if (error) {
            return res.status(500).json({ status: false, message: "Unable to find the details, Please try Later" });
        }
        console.log(data.password, req.body.password)
        bcrypt.compare(req.body.password, data.password, function(error, result){
            if (!result) {
               return res.status(500).json({ status: false, message: "please provide the vaild crds" });
            };
            next();
        })
    })
}

module.exports = decryptPassword;