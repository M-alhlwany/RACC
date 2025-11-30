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

    // عنوان السجل (مثال: رفع مساحي / تم إرسال المعاملة / طلب مرفوض)
    title: {
      type: String,
      required: [true, 'يجب كتابة عنوان للسجل'],
    },

    // حالة السجل
    status: {
      type: String,
      enum: ['new', 'processing', 'done', 'rejected'],
      default: 'new',
    },

    // وصف إضافي
    description: {
      type: String,
    },

    // رابط ملف (اختياري)
    fileUrl: {
      type: String,
    },

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
