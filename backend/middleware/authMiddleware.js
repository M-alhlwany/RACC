import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('غير مصرح بالدخول، الرجاء تسجيل الدخول أولا', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('المستخدم لم يعد موجودًا', 401));
  }
  req.user = currentUser;
  next();
});
