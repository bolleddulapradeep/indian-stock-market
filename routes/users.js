var express = require('express');
var router = express.Router();
var { body, validationResult } = require('express-validator');
var JWT = require('jsonwebtoken');
var AWS_SDK = require('aws-sdk');
var multer = require("multer");
var multers3 = require("multer-s3");
var getEmailValidated = require('../utils/getEmailValidated');
var verifyEmail = require('../utils/verifyEmail');
var encryptPassword = require('../utils/encryptPassword')
var decryptPassword = require('../utils/decryptPassword');
var isAuthenticated = require('../utils/isAuthenticated');
var emailVerificationByUser = require('../utils/emailVerificationByUser');
var User = require('../models/users');
var CompanyAddress = require('../models/companyAddress');

// Email validator,
const s3 = new AWS_SDK.S3({
  secretAccessKey: process.env.SECRET,
  accessKeyId: process.env.ID,
  region: "ap-south-1",
});


var upload = multer({
  limits: {
    fileSize: 10000000,
  } ,
  fileFilter: (req, files, cb) => {
    console.log(req.files.length);
    if (files.originalname.match(/.(pdf)|(png|jpeg|jpg)/)) {
      console.log('in if')
      cb(null, true);
    } else {
      cb(null,false)
    } 
  },
  storage: multers3({
    s3: s3,
    bucket: "stock-market-india",
    metadata: function (req, files, cb) {
      cb(null, { fieldName: files.fieldname });
    },
    key: function (req, files, cb) {
      console.log(files)
      cb(null,req.user.username + "/" + files.originalname + "-" + Date.now().toString());
    },
  }),
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// registration
router.post('/registration', [body('email').isEmail().withMessage('Enter a vaild Email'),body('phone').isLength(10).withMessage('Please enter the valid phone number')], async (req, res, next) => {
  var email = req.body.email;
  var error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(500).json({ status: false, message: ' Please provide the correct email-id' })
  }

  // Checking the email exists or not
  const response = await getEmailValidated(email);
  
  console.log(response);
  if (response === 'valid') {
    var user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone// phone 
    });

    user.save().then(data => {
      const accessToken = JWT.sign({ email: req.body.email }, "tokenGenerated");
      const send = verifyEmail(
        req.body.email,
        "Hey You are registered with us",
        `Congratulations ${req.body.name.toUpperCase()}...! Your data is with us... Please click here http://localhost:8080/users/${accessToken}`,
        "bolledulas.pradeep@gmail.com",
        req,
        res
      );
      res.status(200).json({ status: true, message: ' Registered With US, Please Check your mail to verify', data })
    }).catch(error => {
      res.status(500).json({ status: false, message: 'You are Registered before..! Try with another mail', error })
    })
  } else {
    res.status(500).json({ status: true, message: 'Please Provide us a valid Email' })
  }
});
// verify The mail
router.post("/verify", emailVerificationByUser, async (req, res, next) => {

  //console.log("email", req.params.email);
  //User.count(); // use try catch block
  //const count = (await User.find({ username: { $exists: true } }).count()) + 1;
  //console.log("count", count);
  await User.findOneAndUpdate(
    { email: req.body.email, isVerified: false },
    {
      $set: {
        isVerified: true,
        updatedDate: new Date().toLocaleString(undefined, {
          timeZone: "Asia/Kolkata",
        }),
        username: `PW_8800${
          (await User.find({ username: { $exists: true } }).count()) + 1
        }`,
      },
    },
    { new: true }
  )
    .exec()
    .then((data) => {
      console.log("data", data);
      if (data) {
        const send = verifyEmail(
          req.body.email,
          "Hey You are Verified with us",
          `Congratulations...! You are Verified now. The userId is ${data.username}`,
          "bolledulas.pradeep@gmail.com",
          req,
          res
        );
        return res
          .status(200)
          .json({ status: true, message: "Now You can login" });
      } else {
        res
          .status(500)
          .json({ status: false, message: "You are already verified with us" });
      }
    })
    .catch((error) =>
      res
        .status(500)
        .json({
          status: false,
          message: "Please check your internet connectivity",
        })
    );
});
// Setpassword
router.put('/setpassword', [body('password').isLength(6).withMessage('password Must Contain 6 Characters')],
  encryptPassword, (req, res, next) => {
    User.findOneAndUpdate(
      { username: req.body.username, email: req.body.email },// remove $and
      {
        $set: {
          password: req.body.password,
          updatedDate: new Date().toLocaleString(undefined, {
            timeZone: "Asia/Kolkata",
          }),
        },
      }
    ).exec().then(data => {
      if (data) {
        return res.json({status:true,message:"You password has saved"})
      }
      res.json({status:true,message:"Your username or email is not a valid One"})
    }).catch(error => {
      res.status(500).json({
        status: false,
        message: "Please check your internet connectivity",
      });
    }); 
})




//Login
router.get('/login', decryptPassword, (req, res, next) => {
  const accessToken = JWT.sign({ username: req.body.username}, "tokenGenerated",{expiresIn:"1h"});
  res.status(200).json({status:true, message:"You are Logged In",accessToken:accessToken});
})



router.put("/fileupload", isAuthenticated, upload.array("filename", 3), (req, res, next) => {
  console.log(req.files[0].location,req.files.length, typeof(req.files));
  if (req.files.length ===2) {  
    User.findOneAndUpdate(
      { username: req.user.username },
      {
        $set: {
          docs: {
            incomeProf: req.files[0].location,
            profilePic: req.files[1].location,
          },
          updatedDate: new Date().toLocaleString(undefined, {
            timeZone: "Asia/Kolkata",
          }),
        },
      }
    )
      .exec()
      .then((data) => {
        if (data) {
          return res.json({ status: true, message: "You have uploaded the files" })
        }
        res.json({ status: true, message: "Your username or email is not a valid One" })
      })
      .catch((error) => { });
  } else {
     res.status(500).json({ status: true, message: "Please Provide all the required files" })
  }
    
});

//Update profile
//Update password
//update address
module.exports = router;
