// models/recordModel.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {

    planNumber: String,
    PLANENAME: String,
    DISTRICT: String,
    SUBMUNICIPALITY: String,
    MUNICIPALITY: String,

  },
  {
    // لإظهار الحقول الافتراضية في JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true

  },
);

module.exports = mongoose.model('Plan', planSchema);
