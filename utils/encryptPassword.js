const bcrypt = require("bcrypt");

const encryptPassword = (req, res, next) => {
    console.log('pass')
    console.log(req.body.password);
    bcrypt.hash(req.body.password, 15, function(error, hash) {
        console.log(hash)
        if (error) {
            console.log(error)
        }
        req.body.password = hash;
        next();
    })
}

module.exports = encryptPassword;