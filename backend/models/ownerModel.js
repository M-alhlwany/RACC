// models/ownerModel.js
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: true,
  },

  ownerID: {
    type: String,
    required: true,
    unique: true,
  },
  ownerMobile: String,
  ownerBirthDay: Date,
  ownerEmail: String,

  hasAgent: {
    type: Boolean,
    default: false,
  },

  agentID: String,
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
