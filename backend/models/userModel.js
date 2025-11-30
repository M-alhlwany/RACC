const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { type } = require('os');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    trim: true,
    minLength: [3, 'A name have 3 chrachter at least'],
    maxLength: [40, 'A name have 40 chrachter as maximum'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, 'PLease provied a valid Email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm your password'],
    validate: {
      validator: function (passConfirmValue) {
        return passConfirmValue === this.password;
      },
      message: 'Passwords Are Not the same',
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailConfirmToken: String,
  emailConfirmExpires: Date,
  active: {
    type: Boolean,
    default: false,
    select: false,
    
  createdAt: {
    type: Date,
    default: Date.now,
  },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// set the passwordChangedAt prop to now
userSchema.pre('save', function (next) {
  //return if the password prop not modified or the doc is new
  if (!this.isModified('password') || this.isNew) return next();
  // otherwise set passwordChangedAt to now - 1000
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  console.log(this.getQuery());
  if (!this.getQuery().emailConfirmToken) {
    this.find({ active: { $ne: false } });
  }
  next();
});

userSchema.methods.createEmailConfirmToken = function () {
  //creat plain token to send to user
  const token = crypto.randomBytes(32).toString('hex');
  //create hashed token to save in DB
  this.emailConfirmToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  //create hashed token expires to save in DB
  this.emailConfirmExpires = Date.now() + 10 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // return true if candidatePassword is correct
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (tokenTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    //200 < 100
    console.log(
      'tokenTimeStamp ',
      tokenTimeStamp,
      'changedTimeStamp ',
      changedTimeStamp,
    );
    return tokenTimeStamp < changedTimeStamp;
  }
};
userSchema.methods.createRandomResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
