const Deed = require('../models/deedModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('../controllers/handlerFactory');

// Create Deed
exports.createDeed = catchAsync(async (req, res, next) => {
  const deed = await Deed.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { deed },
  });
});

// Get all deeds
exports.getAllDeeds = factory.getAll(Deed);

// Get single deed
exports.getDeed = factory.getOne(Deed)

// Update deed
exports.updateDeed = factory.updateOne(Deed)

// Delete deed
exports.deleteDeed = factory.deleteOne(Deed)

// Get single deed by DeedNumber
exports.getDeedByDeedNumber = catchAsync(async (req, res, next) => {
  const deedNumber = req.params.deedNumber.toString().trim();
  // حماية إضافية
  if (!deedNumber) {
    return next(new AppError('رقم الصك غير صالح', 400));
  }

  const deed = await Deed.findOne({ deedNumber }).populate('contracts');

  if (!deed) {
    return next(new AppError('لا يوجد صك بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { deed },
  });
});