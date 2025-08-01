const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: true
  }
});

// Ensure one vote per user per election
voteSchema.index({ voter: 1, election: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);