const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('../controllers/handlerFactory');

// Create payment
exports.createPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { payment },
  });
});

// Get all payments
exports.getAllPayments = factory.getAll(Payment);

// Get one payment
exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate('contract');

  if (!payment) {
    return next(new AppError('لا يوجد دفعه بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { payment },
  });
});

// Update payment
exports.updatePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!payment) {
    return next(new AppError('لا يوجد دفعه بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { payment },
  });
});

// Delete payment
exports.deletePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    return next(new AppError('لا يوجد دفعه بهذا الرقم', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get all payments for a specific contract
exports.getPaymentsByContract = catchAsync(async (req, res, next) => {
  const payments = await Payment.find({ contract: req.params.contractId });

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: { payments },
  });
});

// Create payment for a specific contract
exports.createPaymentForContract = catchAsync(async (req, res, next) => {
  req.body.contract = req.params.contractId;

  const payment = await Payment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { payment },
  });
});
