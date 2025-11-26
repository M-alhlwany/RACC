import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('لا يوجد مستند بهذا المعرف', 404));
    res.status(204).json({ status: 'success', data: null });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) return next(new AppError('لا يوجد مستند بهذا المعرف', 404));
    res.status(200).json({ status: 'success', data: { doc } });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: { doc } });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) return next(new AppError('لا يوجد مستند بهذا المعرف', 404));
    res.status(200).json({ status: 'success', data: { doc } });
  });

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    const total = await Model.countDocuments(filter);
    const docs = await Model.find(filter).skip(skip).limit(limit).sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        docs
      }
    });
  });
