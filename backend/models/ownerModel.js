// models/ownerModel.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: true,
  },

  ownerID: {
    type: Number,
    required: true,
  },
  ownerMobile: Number,
  ownerBirthDay: Date,
  ownerEmail: String,

  hasAgent: {
    type: Boolean,
    default: false,
  },

  agentID: Number,
  agencyNumber: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
  {
    timestamps: true
  });

module.exports = mongoose.model('Owner', ownerSchema);
