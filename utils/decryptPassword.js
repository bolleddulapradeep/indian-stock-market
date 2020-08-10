const bcrypt = require("bcrypt");
const User = require("../models/users");
const decryptPassword = async (req, res, next) => {
  await User.findOne({ username: req.body.username })
    .exec()
    .then((data) => {
      bcrypt.compare(req.body.password, data.password, function (
        error,
        result
      ) {
        if (!result) {
          return res
            .status(500)
            .json({ status: false, message: "please provide the vaild crds" });
        }
        next();
      });
    })
    .catch((error) => {
      return res
        .status(500)
        .json({
          status: false,
          message: "Unable to find the details, Please try Later",
        });
    });
};

module.exports = decryptPassword;
