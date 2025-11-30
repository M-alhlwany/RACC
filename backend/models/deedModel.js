// models/deedModel.js
const mongoose = require('mongoose');

const deedSchema = new mongoose.Schema({
  deedNumber: {
    type: String,
    required: [true, 'رقم الصك مطلوب'],
    unique: true,
  },

  deedDate: String,
  source: String,
  area: Number,

  // ♦ الربط الجديد عبر ownerID بدلاً من _id
  ownerID: {
    type: String,
    required: true
  },

  pieceNumber: String,
  planNumber: String,
  district: String,
  municipality: String,
  street: String,
  city: {
    type: String,
    default: 'jeddah',
  },

  propertyStatus: String,
  buildingType: String,
  buildingSystem: String,
  floorsCount: Number,

  northBoundary: String,
  eastBoundary: String,
  southBoundary: String,
  westBoundary: String,

  districtCorrection: String,

  // صك ← عدة عقود
  contracts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Contract',
    },
  ],

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// -------------------------------
//   VIRTUAL POPULATE: Owner
// -------------------------------
deedSchema.virtual('owner', {
  ref: 'Owner',          // الموديل الهدف
  localField: 'ownerID', // ما بداخل الصك
  foreignField: 'ownerID', // ما بداخل المالك
  justOne: true
});


// -------------------------------
//  Auto Populate للمالك
// -------------------------------
deedSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: 'ownerName ownerMobile ownerID'
  });

  next();
});


module.exports = mongoose.model('Deed', deedSchema);
