var JWT = require('jsonwebtoken');
const isAuthenticated = (req, res, next) => {
    console.log('is Authenticated')

      console.log(req.username);
      if (req.headers.authorization) {
        JWT.verify(
          req.headers.authorization.replace("Bearer ", ""),
          "tokenGenerated",
          (err, tokenUserData) => {
            if (err) {
              return res.sendStatus(403);
            }
            req.user = tokenUserData;
            if (req.user.username === req.body.username) {
              next();
            } else {
                return res.status(500).json({ status: false , message:'JWT Token is Expired... Please Login'});
            }
          }
        );
      } else {
        res.status(500).json({ status: false , message:'Please Provide the JWT Token' });
      }

}
module.exports = isAuthenticated;