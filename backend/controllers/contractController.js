const Contract = require('../models/contractModel');
const Deed = require('../models/deedModel');
const Owner = require('../models/ownerModel');
const Payment = require('../models/paymentModel');
const Record = require('../models/recordModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('../controllers/handlerFactory');

//------------------------------
// ⭐ Create Contract
//------------------------------

exports.createContract = catchAsync(async (req, res, next) => {
  // 1) البحث عن الصك باستخدام رقم الصك
  const deed = await Deed.findOne({ deedNumber: req.body.deedNumber });

  if (!deed) {
    return next(new AppError('لا يوجد صك بهذا الرقم', 404));
  }


  // 2) ربط العقد بالصك
  req.body.deed = deed._id;

  // 3) إنشاء العقد
  const contract = await Contract.create(req.body);

  // 4) إضافة العقد لقائمة العقود المرتبطة بالصك
  await Deed.findByIdAndUpdate(deed._id, {
    $push: { contracts: contract._id }
  });

  res.status(201).json({
    status: 'success',
    data: { contract }
  });
});



//------------------------------
// ⭐ Get All Contracts
//------------------------------
exports.getAllContracts = factory.getAll(Contract);

//------------------------------
// ⭐ Get Contract by ID
//------------------------------
exports.getContract = catchAsync(async (req, res, next) => {
  const contract = await Contract.findById(req.params.id)
    .populate('owner')
    .populate('deed');

  if (!contract) {
    return next(new AppError('لا يوجد عقد بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { contract },
  });
});

//------------------------------
// ⭐ Update Contract
//------------------------------
exports.updateContract = catchAsync(async (req, res, next) => {
  const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!contract) {
    return next(new AppError('لا يوجد عقد بهذا الرقم', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { contract },
  });
});

//------------------------------
// ⭐ Delete Contract
//------------------------------
exports.deleteContract = catchAsync(async (req, res, next) => {
  const contract = await Contract.findByIdAndDelete(req.params.id);

  if (!contract) {
    return next(new AppError('لا يوجد عقد بهذا الرقم', 404));
  }

  // إزالة العقد من الصك
  await Deed.findByIdAndUpdate(contract.deed, {
    $pull: { contracts: contract._id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//------------------------------
// ⭐ Get Contract with Deep Relations
//------------------------------
exports.getContractDeep = catchAsync(async (req, res, next) => {
  const contract = await Contract.findById(req.params.id)
    .populate('owner')
    .populate('deed');

  if (!contract) {
    return next(new AppError('لا يوجد عقد بهذا الرقم', 404));
  }

  // جلب المدفوعات المرتبطة بالعقد
  const payments = await Payment.find({ contract: contract._id });

  // جلب السجلات المرتبطة بالعقد
  const records = await Record.find({ contract: contract._id });

  res.status(200).json({
    status: 'success',
    data: {
      contract,
      payments,
      records,
    },
  });
});
