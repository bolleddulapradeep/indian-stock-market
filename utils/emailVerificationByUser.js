var JWT = require("jsonwebtoken");
const emailVerificationByUser = (req, res, next) => {
  JWT.verify(
    req.params.verify_email,
    "tokenGenerated",
    (err, tokenUserData) => {
      console.log(err);
      if (err) {
        return res.sendStatus(403);
      }
      req.user = tokenUserData;
      next();
    }
  );
};
module.exports = emailVerificationByUser;
