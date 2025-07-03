const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  milestones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }],
  createdAt: { type: Date, default: Date.now },
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
