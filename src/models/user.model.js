

const mongoose = require('mongoose') ;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  
  lastLogin: { type: Date, default: Date.now },

  isVerified: { type: Boolean, default: false },
  
  verificationToken: String,
  
  resetPasswordToken: String ,
  resetPasswordTokenExpiresAt: Date,



},
{ timestamps: true }
);

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;