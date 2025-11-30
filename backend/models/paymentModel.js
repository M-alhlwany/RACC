// models/paymentModel.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.ObjectId,
    ref: 'Contract',
    required: true,
  },

  projectCode: String,

  paymentDate: {
    type: Date,
    default: Date.now,
  },

  method: {
    type: String,
    enum: ['تحويل', 'كاش', 'شبكة'],
  },

  paymentNumber: Number, // دفعة رقم

  amount: Number, // المدفوع
  previous: Number, // السابق
  remaining: Number, // المتبقي

  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
  {
    timestamps: true
  });

module.exports = mongoose.model('Payment', paymentSchema);
