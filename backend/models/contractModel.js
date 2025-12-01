const mongoose = require('mongoose');
const Counter = require('./counterModel'); // عداد لعدم التكرار

const contractSchema = new mongoose.Schema(
  {
    // كود العقد (يتم توليده تلقائياً)
    projectCode: {
      type: String,
      unique: true,
      sparse: true
    },

    deed: {
      type: mongoose.Schema.ObjectId,
      ref: 'Deed',
      required: [true, 'يجب ربط صك بالعقد']
    },

    workScope: {
      type: String,
      required: [true, 'يجب تحديد نطاق العمل']
    },

    contractValue: {
      type: Number,
      required: [true, 'قيمة العقد مطلوبة']
    },

    contractDate: {
      type: Date,
      default: Date.now
    },
    contract_link: String,
    output_link: String,

    notes: String,
    belongsTo: String,

    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

//----------------------------------------------
// ⭐ توليد كود العقد PO-YYMMDD-000001 لا يتكرر
//----------------------------------------------
contractSchema.pre('save', async function (next) {
  if (this.projectCode) return next();

  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');

  // الحصول على عداد ثابت لا يتأثر بالحذف
  const counter = await Counter.findOneAndUpdate(
    { name: 'contract' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const serial = counter.seq.toString().padStart(6, '0');

  this.projectCode = `PO-${y}${m}${d}-${serial}`;
  next();
});

contractSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'deed',
    select: 'deedNumber district parcel plan'
  });

  next();
});

module.exports = mongoose.model('Contract', contractSchema);
