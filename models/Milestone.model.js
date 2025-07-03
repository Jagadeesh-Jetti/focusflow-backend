const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetDate: { type: Date, required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  isCompleted: { type: Boolean, default: false },
});

const Milestone = mongoose.model('Milestone', milestoneSchema);
module.exports = Milestone;
