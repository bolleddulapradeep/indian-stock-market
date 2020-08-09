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
  },
  storage: multers3({
    s3: s3,
    bucket: "stock-market-india",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      console.log(file);
      cb(null, req.body.username + "/" + file.filename + Date.now().toString());
    },
  }),
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// registration
router.post('/registration', [body('email').isEmail().withMessage('Enter a vaild Email')], async (req, res, next) => {
  var email = req.body.email;
  var error = validationResult(req);
  console.log(error)
  if (!error.isEmpty()) {
    return res.status(500).json({ status: false, message: ' Please provide the correct email-id' })
  }

  // Checking the email exists or not
  const response = await getEmailValidated(email);
  console.log(response);
  if (response === 'valid') {
    console.log('U Have Enterd a valid email');
    var user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone// phone 
    });
    user.save((error, data) => {
      console.log(error, data);
      if (error) {
        return res.status(500).json({ status: false, message: 'You are Registered before..! Try with another mail', error })
      }
      const send = verifyEmail(
        req.body.email,
        "Hey You are registered with us",
        `Congratulations ${req.body.name.toUpperCase()}...! Your data is with us... Please click here http://localhost:8080/users/${req.body.email}`,
        "bolledulas.pradeep@gmail.com",
        req,
        res
      );
      res.status(200).json({ status: true, message: ' Registered With US, Please Check your mail to verify', data })
    })
  } else {
    res.status(500).json({ status: true, message: 'Please Provide us a valid Email' })
  }
  
});
// verify The mail
router.patch('/:email', async (req, res, next) => {// use post
  console.log("email", req.params.email);
  //User.count(); // use try catch block
  const count = (await User.find({ username: { $exists: true } }).count()) + 1;
  console.log("count",count);
  User.findOneAndUpdate(
    { $and: [{ email: req.params.email },{isVerified:false}]},
    {
      $set: {
        isVerified: true,
        updatedDate: new Date().toLocaleString(undefined, {
          timeZone: "Asia/Kolkata",
        }),
        username: `PW_8800${count}`,// use index functionality _id format
        //new:true 3rd arg
      },
    },{new:true}
  ).exec((error, data) => {
    console.log(data);
    if (data) {
      const send = verifyEmail(
        req.params.email,
        "Hey You are Verified with us",
        `Congratulations...! You are Verified now. The userId is `,
        "bolledulas.pradeep@gmail.com",
        req,
        res
      );
      return res.status(200).json({status:true, message:"Now You can login"})
    } else {
      res.status(500).json({status:false, message:"You are already verified with us"})
    }
  });
})
// Setpassword
router.put('/setpassword', [body('password').isLength(6).withMessage('password Must Contain 6 Characters')], encryptPassword, (req, res, next) => {
  User.findOneAndUpdate(
    { $and: [{ username: req.body.username },{email:req.body.email}] },// remove $and
    {
      $set: {
        password: req.body.password,
        updatedDate: new Date().toLocaleString(undefined, {
          timeZone: "Asia/Kolkata",
        }),
      },
    }
  ).exec((error, data) => {
    console.log(data)
    if (data) {
      return res.json({status:true,message:"You password has saved", password:req.body.password})
    }
    res.json({status:true,message:"Your username is not a valid One", password:req.body.password})
  }); 
})

//Login
router.get('/login', decryptPassword, (req, res, next) => {
  const accessToken = JWT.sign({ username: req.body.username,password:req.body.password }, "tokenGenerated",{expiresIn:"1h"});
  res.json({ token: accessToken });
})

router.put("/fileupload",upload.array("filename",3) ,isAuthenticated, (req,res, next) => {
  console.log(req.files)
    res.json({status:true,message:'You can upload the data'})
});
module.exports = router;
