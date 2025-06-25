const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFilename: { type: String, required: true },
  processedFilename: { type: String, required: true },
  operation: { type: String, enum: ['compress', 'decompress'], required: true },
  algorithm: { type: String, required: true },
  originalSize: { type: Number, required: true },
  processedSize: { type: Number, required: true },
  compressionRatio: { type: String },
  processingTime: { type: Number, required: true },
  stats: { type: mongoose.Schema.Types.Mixed },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema); 