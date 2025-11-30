const Record = require('../models/recordModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('../controllers/handlerFactory');

// Create record
exports.createRecord = catchAsync(async (req, res, next) => {
  const record = await Record.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { record },
  });
});

// Get all records
exports.getAllRecords = factory.getAll(Record);

// Get single record
exports.getRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findById(req.params.id).populate('contract');

  if (!record) {
    return next(new AppError('لا يوجد سجل بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { record },
  });
});

// Update record
exports.updateRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    return next(new AppError('لا يوجد سجل بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { record },
  });
});

// Delete record
exports.deleteRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findByIdAndDelete(req.params.id);

  if (!record) {
    return next(new AppError('لا يوجد سجل بهذا الرقم', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get records for a specific contract
exports.getRecordsByContract = catchAsync(async (req, res, next) => {
  const records = await Record.find({ contract: req.params.contractId });

  res.status(200).json({
    status: 'success',
    results: records.length,
    data: { records },
  });
});

// Create record for a specific contract
exports.createRecordForContract = catchAsync(async (req, res, next) => {
  req.body.contract = req.params.contractId;

  const record = await Record.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { record },
  });
});
