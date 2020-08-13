const bcrypt = require("bcrypt");
const encryptPassword = (req, res, next) => {
    console.log('pass')
    console.log(req.body.reset_password);
    bcrypt.hash(req.body.reset_password, 10, function (error, hash) {
      console.log(hash);
      if (error) {
        console.log(error);
    }
      req.body.reset_password = hash;
      next();
    });
}

module.exports = encryptPassword;