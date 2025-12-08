// models/recordModel.js
const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    // العقد المرتبط بالسجل
    contract: {
      type: mongoose.Schema.ObjectId,
      ref: 'Contract',
      required: [true, 'يجب ربط السجل بعقد'],
    },
    recordNumber: Number,

    // حالة السجل
    currentState: {
      type: String,
      enum: ['new', 'processing', 'done', 'rejected'],
      default: 'new',
    },
    previousState: {
      type: String,
      default: '',
    },
    notes: String,
    recordDate: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // لإظهار الحقول الافتراضية في JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true

  },
);

module.exports = mongoose.model('Record', recordSchema);
