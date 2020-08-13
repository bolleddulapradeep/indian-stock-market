var express = require("express");
var router = express.Router();
var { body, validationResult } = require("express-validator");
var JWT = require("jsonwebtoken");
var AWS_SDK = require("aws-sdk");
var multer = require("multer");
var multers3 = require("multer-s3");
var getEmailValidated = require("../utils/getEmailValidated");
var verifyEmail = require("../utils/verifyEmail");
var encryptPassword = require("../utils/encryptPassword");
var decryptPassword = require("../utils/decryptPassword");
var isAuthenticated = require("../utils/isAuthenticated");
var emailVerificationByUser = require("../utils/emailVerificationByUser");
var decryptRegistrationPass = require("../utils/decryptRegistrationPass");
var encryptRegistrationPass = require("../utils/encryptRegistrationPass");
var User = require("../models/users");
var CompanyAddress = require("../models/companyAddress");

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
  fileFilter: (req, files, cb) => {
    if (files.originalname.match(/.(pdf)|(png|jpeg|jpg)/)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  storage: multers3({
    s3: s3,
    bucket: "stock-market-india",
    metadata: function (req, files, cb) {
      cb(null, { fieldName: files.fieldname });
    },
    key: function (req, files, cb) {
      cb(null,req.user.username +"/" +files.originalname +"-" +Date.now().toString());
    },
  }),
});

/* GET users listing. */
router.post("/",function (req, res, next) {
  res.send("Hey you are in auth folder")
});


// registration
router.post("/auth/registration", [body("email").isEmail().withMessage("Enter a vaild Email"),
    body("phone").isLength(10).withMessage("Please enter the valid phone number"),
    body("password").isLength(6).withMessage("Please enter a 6 Char length password")],
  getEmailValidated,encryptRegistrationPass,async (req, res, next) => {
    try {
      var error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(500).json({status: false,message: "Please provide the 6 length char password ",});
      }

      const accessToken = JWT.sign({ email: req.body.email }, "tokenGenerated");
      var user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        verifyingMail: accessToken,
      });

      let data = await user.save();
      const send = verifyEmail(
        req.body.email,
        "Hey You are registered with us",
        `Congratulations ${req.body.name.toUpperCase()}...! Your data is with us... 
                    Please click here http://localhost:8080/app/v1/auth/${accessToken}`,
        "bolledulas.pradeep@gmail.com",req,res
      );
      res.status(200).json({status: true,message: " Registered With US, Please Check your mail to verify your mail",});
    } catch (error) {
      res.status(500).json({status: false,message: "The Given mail-id is registered before..! Try with another mail", error,
      });
    }
  }
);

// verify The mail
router.post("/auth/:verify_email",emailVerificationByUser,async (req, res, next) => {
  try {
    let count = (await User.find({ username: { $exists: true } }).count()) + 1;
      const data = await User.findOneAndUpdate(
        { email: req.user.email,isDeleted:false},
        {
          $set: {
            isVerified: true,
            updatedDate: new Date().toLocaleString(undefined, {
              timeZone: "Asia/Kolkata",
            }),
            username: `PW_8800${count}`,
          },
        },
        { new: true }
      );
      if (data) {
        const send = verifyEmail(
          req.user.email,
          "Hey You are Verified with us",
          `Congratulations...! You are Verified now. The userId is ${data.username}`,
          "bolledulas.pradeep@gmail.com",req,res
        );
        return res.status(200).json({status: true,message:"You are verified now... you can set your password by clicking the below link",});
      } else {
        res.status(500).json({ status: false, message: "You are already verified" });
      }
    } catch (error) {
      return res.status(403).json({ status: false, message: "You are fired a wrong Url" });
    }
  }
);

// Setpassword
router.put("/auth/credentials/reset_password",
  [body("password").isLength(6).withMessage("password Must Contain 6 Characters"),], encryptPassword, decryptRegistrationPass,
  async (req, res, next) => {
    try {
      var data = await User.findOneAndUpdate(
        {
          username: req.body.username,
          isVerified:true,
          reset_password: { $exists: false },
        },
        {
          $set: {
            reset_password: req.body.reset_password,
            updatedDate: new Date().toLocaleString(undefined, {
              timeZone: "Asia/Kolkata",
            }),
          },
        },
        { new: true }
      );
      if (data) {
        return res.status(200).json({status: true,message: "U have changed the password sucessfully",});
      }
     return res.status(500).json({status: false,message: "You have already changed the password",});
    } catch (error) {
      return res.status(403).json({status: false,message: "Unable to fetch the data... Please try later",});
    }
  }
);

//Login
router.get("/login", decryptPassword, (req, res, next) => {
  const accessToken = JWT.sign({username: req.body.username , isDeleted:false},"tokenGenerated",{ expiresIn: "1h" });
  res.status(200).json({status: true,message: "You are Logged In",accessToken: accessToken,});
});

// Profile Upload
router.put("/fileupload",isAuthenticated,upload.array("filename", 3),
  async (req, res, next) => {
    if (req.files.length === 2) {
      try {
        var data = await User.findOneAndUpdate(
          { username: req.user.username },
          {$set: {
              docs: {
                incomeProf: req.files[0].location,
                profilePic: req.files[1].location,
              },
              updatedDate: new Date().toLocaleString(undefined, {
                timeZone: "Asia/Kolkata",
              }),
            },
          }
        );

        if (data) {
          return res.json({status: true,message: "You have uploaded the files"});
        } else {
          res.status(500).json({status: true,message: "Please login to upload"});
        }
      } catch (error) {
        res.status(400).json({status: true,message: "Cant fetch Details Try later"});
      }
    }
  }
);

// Update Password
router.get("/auth/forgot_password", encryptPassword,async (req, res, next) => {
  try {
    var data = await User.findOne({ username: req.body.username });
    if (data) {
      const accessToken = JWT.sign({ username: req.body.username, reset_password:req.body.reset_password }, "tokenGenerated");
      const send = verifyEmail(
        data.email,"Hey you forgot your password",
        `Hey ${data.name.toUpperCase()}...! Please click here http://localhost:8080/app/v1/auth/change_password/${accessToken}   to Update the password`,
        "bolledulas.pradeep@gmail.com",req,res
      );
      return res.status(200).json({status: true,message: "Hey Please check the mail to update the password",});
    } else {
      res.status(500).json({status: true,message: "Hey please provide the vaild username",});
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "Unable to fetch the data" });
  }
});

// update Password
router.post("/auth/change_password/:verify_email",emailVerificationByUser ,async (req, res, next) => {
 
  try {
    var data = await User.findOneAndUpdate({ username: req.user.username },
      {$set: {
          reset_password: req.user.reset_password,
          updatedDate: new Date().toLocaleString(undefined, {
            timeZone: "Asia/Kolkata",
          }),},},{ new: true }
    );
    console.log(data);
    if (data) {
      res.status(200).json({ status: true, message: "Updated Successfully", data: data });
    } else {
      res.status(500).json({status: false,message: "Please provide the vaild details",data: data,});
    }
  } catch (error) {
    res.status(403).json({status: false,message: "Unable to fetch the data",});
  }
  
});


//Update password
router.put('/update_password', isAuthenticated, encryptPassword,async (req, res, next) => {
  try {
    var data = await User.findOneAndUpdate(
      { username: req.user.username },
      {$set: {
          reset_password: req.body.reset_password,
          updatedDate: new Date().toLocaleString(undefined, {
            timeZone: "Asia/Kolkata",
          }),},},
        { new: true }
    );
    if (data) {
        res.status(200).json({ status: true, message: "Updated the password Successfully",data:data });
    } else {
      res.status(500).json({ status: true, message: "Cant able to find the User" });
    }
  } catch (error) {
    res.status(403).json({status: false,message: "Unable to fetch the data",});
  }

})


//update address
router.put("/address", isAuthenticated,async (req, res, next) => {
  try {
    var data = await User.findOneAndUpdate({ username: req.user.username },
      {$set: {address: {
            village: req.body.village,
            state: req.body.state,
            city: req.body.city,
            pincode: req.body.pincode,},
          updatedDate: new Date().toLocaleString(undefined, {timeZone: "Asia/Kolkata",}),},},{ new: true }
    )
    if (data) {
      res.status(200).json({ status: true, message: "Updated the Address Successfully", data: data });
    } else {
      res.status(500).json({ status: true, message: "Cant able to find the User" });
    }
  } catch (error) {
    res.status(403).json({status: false, message: "Unable to fetch the data",});
  }
});


//delete user
router.put("/deleteUser", isAuthenticated, async (req, res, next) => {
  console.log(req.user.username);
  try{
  var data = await User.findOneAndUpdate(
    { username: req.user.username, isVerified: true },
    {$set: {isDeleted: true,updatedDate: new Date().toLocaleString(undefined, {timeZone: "Asia/Kolkata",})}},
    { new: true }
  );
  if (data) {
    res.status(200).json({status: true,message: `${req.user.username} got deleted...!`});
  } else {
    res.status(500).json({status: true,message: `Cant find the user to delete...!`,});
  }
}catch(error) {
      res.status(403).json({status: false,message: "Can't able to fetch the data userGot deleted",});
    }
});
module.exports = router;
