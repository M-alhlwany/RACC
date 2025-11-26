// models/paymentModel.js
import mongoose from 'mongoose';
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
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;