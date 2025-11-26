import mongoose from 'mongoose';
import Counter from'./counterModel'; // عداد لعدم التكرار

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
      ref: 'Deed'
    },

    // رقم الصك (لا يكون required هنا لأنه يؤخذ من الصك عند الإنشاء)
    deedNumber: {
      type: String,
      required: [true, 'يجب ربط العقد بصك']
    },

    // نطاق العمل
    workScope: {
      type: String,
      required: [true, 'يجب تحديد نطاق العمل']
    },

    // المالك (اختياري)
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'Owner'
    },

    // قيمة العقد
    contractValue: {
      type: Number,
      required: [true, 'قيمة العقد مطلوبة']
    },

    // تاريخ العقد
    contractDate: {
      type: Date,
      default: Date.now
    },

    // ملاحظات
    notes: String,

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
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

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
