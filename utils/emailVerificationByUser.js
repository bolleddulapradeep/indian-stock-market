var JWT = require("jsonwebtoken");
const emailVerificationByUser = (req, res, next) => {
    if (req.headers.authorization) {
        JWT.verify(req.headers.authorization.replace("Bearer ", ""),
            "tokenGenerated", (err, tokenUserData) => {
                if (err) {
                    return res.sendStatus(403);
                }
                req.user = tokenUserData;
                req.body = req.user;
                console.log(req.user)
                next();                    
            });
    }
}
module.exports = emailVerificationByUser;
