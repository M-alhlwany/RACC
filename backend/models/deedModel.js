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

  ownerName: {
    type: String,
    required: true,
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

  // (**الجديد**) صك واحد يمكنه الارتباط بعدة عقود
  contracts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Contract',
    },
  ],

  createdAt: { type: Date, default: Date.now },
},
  {
    timestamps: true
  });

// Populate owner automatically on any find

// deedSchema.pre('find' , ()=>{

// })

module.exports = mongoose.model('Deed', deedSchema);
