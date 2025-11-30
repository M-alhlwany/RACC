// controllers/ownerController.js
const Owner = require('../models/ownerModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('../controllers/handlerFactory');

//-----------------------------------
// ⭐ Create Owner
//-----------------------------------
exports.createOwner = catchAsync(async (req, res, next) => {
  const owner = await Owner.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { owner },
  });
});

//-----------------------------------
// ⭐ Get All Owners
//-----------------------------------
exports.getAllOwners = factory.getAll(Owner);

//-----------------------------------
// ⭐ Get Single Owner
//-----------------------------------
exports.getOwner = catchAsync(async (req, res, next) => {
  const owner = await Owner.findById(req.params.id);

  if (!owner) {
    return next(new AppError('لا يوجد مالك بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { owner },
  });
});

//-----------------------------------
// ⭐ Update Owner
//-----------------------------------
exports.updateOwner = catchAsync(async (req, res, next) => {
  const owner = await Owner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!owner) {
    return next(new AppError('لا يوجد مالك بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { owner },
  });
});

//-----------------------------------
// ⭐ Delete Owner
//-----------------------------------
exports.deleteOwner = catchAsync(async (req, res, next) => {
  const owner = await Owner.findByIdAndDelete(req.params.id);

  if (!owner) {
    return next(new AppError('لا يوجد مالك بهذا الرقم', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
