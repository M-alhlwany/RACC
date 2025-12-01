const Contract = require('../models/contractModel');
// const Deed = require('../models/deedModel');
// const Owner = require('../models/ownerModel');
// const Payment = require('../models/paymentModel');
// const Record = require('../models/recordModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError');
const factory = require('../controllers/handlerFactory');

//------------------------------
// ⭐ Create Contract
//------------------------------

exports.createContract = factory.createOne(Contract)

//------------------------------
// ⭐ Get All Contracts
//------------------------------
exports.getAllContracts = factory.getAll(Contract);

//------------------------------
// ⭐ Get Contract by ID
//------------------------------
exports.getContract = factory.getOne(Contract)
//------------------------------
// ⭐ Update Contract
//------------------------------
exports.updateContract = factory.updateOne(Contract)
//------------------------------
// ⭐ Delete Contract
//------------------------------
exports.deleteContract = factory.deleteOne(Contract)
//------------------------------
// ⭐ Get Contract with Deep Relations
//------------------------------

// exports.getContractDeep = catchAsync(async (req, res, next) => {
//   const contract = await Contract.findById(req.params.id)
    
//   if (!contract) {
//     return next(new AppError('لا يوجد عقد بهذا الرقم', 404));
//   }

//   // جلب المدفوعات المرتبطة بالعقد
//   const payments = await Payment.find({ contract: contract._id });

//   // جلب السجلات المرتبطة بالعقد
//   const records = await Record.find({ contract: contract._id });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       contract,
//       payments,
//       records,
//     },
//   });
// });
