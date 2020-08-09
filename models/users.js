const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Users = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: [true, "Please Provide the mail-id"] },
  username: { type: String },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  phone: {
    type: Number,
    maxlength: 10,
    required: [true, "Please Provide the Phone Number"],
  },
  docs: {
    profilePic: { type: String },
    incomeProf: { type: String },
    pan: { type: String },
  },
  address: {
    village: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: "India" },
    pincode: { type: String },
  },
  companyAddress: {
    type: Schema.Types.ObjectId,
    ref: "companyAddress",
  },
  registeredDate: {
    type: Date,
    default: new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
  },
  updatedDate: {
    type: Date,
    default: new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
  },
});

module.exports = mongoose.model("User", Users);
