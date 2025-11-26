// models/ownerModel.js
import mongoose from 'mongoose';

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
});

const Owner = mongoose.model('Owner', ownerSchema);

export default Owner;
