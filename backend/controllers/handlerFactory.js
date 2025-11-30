const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatuers');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//Get One Function
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    popOptions ? (query = query.populate(popOptions)) : (query = query);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// Get All Function (with real total + pagination)
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    // Nested routes (مثل العقود داخل صك)
    // if (req.params.tourId) filter = { tour: req.params.tourId };

    // 1️⃣ إجمالي السجلات الحقيقي قبل pagination
    const total = await Model.countDocuments(filter);

    // 2️⃣ APIFeatures (فلترة + فرز + تحديد حقول + Pagination)
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    // 3️⃣ حساب عدد الصفحات
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 20;
    const pages = Math.ceil(total / limit);

    // 4️⃣ الإخراج النهائي
    res.status(200).json({
      status: 'success',
      page,
      limit,
      total,       // 🔥 إجمالي كل السجلات (حتى لو انت على limit=1)
      pages,       // 🔥 عدد الصفحات
      results: docs.length,
      data: docs,
    });
  });


exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
