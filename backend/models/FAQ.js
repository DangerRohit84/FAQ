const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  q: { type: String, required: true },
  a: { type: String, required: true },
  source: { type: String, enum: ['official', 'community'], default: 'official' },
  resolved: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
});

const categorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  icon: { type: String, required: true },
  questions: [questionSchema],
});

module.exports = mongoose.model('FAQ', categorySchema);
