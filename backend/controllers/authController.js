const User = require('./../models/userModel');
const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Email = require('./../utils/email');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('JWT', token, cookieOptions);
  //remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //create confrim token
  const confirmToken = newUser.createEmailConfirmToken();

  await newUser.save({ validateBeforeSave: false });
  const confirmUrl = `${req.protocol}://${req.get('host')}/api/v1/users/confirmEmail/${confirmToken}`;
  await new Email(newUser, confirmUrl).sendConfirmEmail();

  res.redirect('/resendConfirmation');

  // res.status(201).json({
  //   status: 'success',
  //   message: 'تم إنشاء الحساب، رجاء تحقق من بريدك الإلكتروني للتأكيد',
  // });

  // const url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(newUser, url).sendWelcom();
  // send token for loggin
  // createSendToken(newUser, 200, res);
});

exports.resendConfirmation = (req, res) => {
  res.status(200).render('resendConfirmation', {
    title: 'resendConfirmation',
  });
};

exports.confirmEmail = catchAsync(async (req, res, next) => {
  //

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailConfirmToken: hashedToken,
    emailConfirmExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('the token invalid or expired', 400));
  }

  user.active = true;
  user.emailConfirmToken = undefined;
  user.emailConfirmExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // res.status(200).json({
  //   status: 'success',
  //   message: 'تم تفعيل الحساب بنجاح ✅',
  // });

  // createSendToken(user, 200, res);
  res.redirect(`${req.protocol}://${req.get('host')}/login`);
});

// loggin middleware to compare email and password and send token to browser to loggin
exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  //1) check if email and password are exists
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  //2)check if user exist && password is correct
  const user = await User.findOne({ email }).select('+password');

  //compare email and password
  // const correct = await user.correctPassword(password, user.password);
  // if not found user or password is not correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //send token for loggin
  createSendToken(user, 200, res);
});

// logout middleware //
exports.logout = (req, res) => {
  res.cookie('JWT', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

// protect middleware and put user in req
exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token and check if it's there
  /*
  let token ;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {
    token = req.headers.authorization.split(' ')[1]
  }
  */
  // if headers contain authorization and authorization starts with Bearer
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;
  //if there is cookie
  if (req.cookies.JWT) token = req.cookies.JWT;
  // if not token thorw error
  if (!token) {
    return next(
      new AppError('you are not logged in! or Token is No valid token', 401),
    );
  }
  // 2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exits
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('the user no longer exists', 401));
  }
  // 4) check if user change password after JWT stablished
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password was changed ,Please log lN again', 401));
  }
  // put currentUser in req
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  try {
    if (req.cookies.JWT) {
      // 1) verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.JWT,
        process.env.JWT_SECRET,
      );
      // 2) check if user still exits
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      // 3) check if user change password after JWT stablished
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      res.locals.user = currentUser;

      return next();
    }
  } catch (err) {
    return next();
  }
  next();
});

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    // role is an array
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('you do not have permision to perform this action', 403),
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there no user with that email'));
  }
  // 2)generate random rest Token
  const resetToken = user.createRandomResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
  //sending email ....
  try {
    await new Email(user, resetURL).sendPasswordReset();
    // sendEmail.sendPasswordReset();
    // await sendEmail({
    //   email: user.email,
    //   subject: `your password reset Token (valid for 10 min)`,
    //   message,
    // });
    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('there was an error sending email, tray later', 500),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on token
  // encrypt token and compire it with the one encrypted in dataBase
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) if token has no expire and there is user
  if (!user) {
    return next(new AppError('Token is invalid or Expired', 400));
  }
  // then set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // delete token and date Expire form dataBase
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) set passwordChangedAt prop in userModel
  // 4) log the user in , send JWT
  createSendToken(user, 200, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) get the user form collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) check if the currnet password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('your current password is wrong', 401));
  }
  //so,then
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //send Token for login
  createSendToken(user, 200, res);
});
