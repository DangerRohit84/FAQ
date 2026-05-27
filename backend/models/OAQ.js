const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  votedUpBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  votedDownBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  accepted: { type: Boolean, default: false },
}, { timestamps: true });

answerSchema.virtual('upvotes').get(function() { return (this.votedUpBy || []).length; });
answerSchema.virtual('downvotes').get(function() { return (this.votedDownBy || []).length; });
answerSchema.virtual('netVotes').get(function() { return (this.votedUpBy || []).length - (this.votedDownBy || []).length; });
answerSchema.set('toJSON', { virtuals: true });

const oaqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  votedUpBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  votedDownBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  answers: [answerSchema],
  status: { type: String, enum: ['open', 'approved', 'promoted', 'rejected'], default: 'open' },
  promotedCount: { type: Number, default: 0 },
}, { timestamps: true });

oaqSchema.virtual('upvotes').get(function() { return (this.votedUpBy || []).length; });
oaqSchema.virtual('downvotes').get(function() { return (this.votedDownBy || []).length; });
oaqSchema.virtual('netVotes').get(function() { return (this.votedUpBy || []).length - (this.votedDownBy || []).length; });
oaqSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('OAQ', oaqSchema);
