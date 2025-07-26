const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },

  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'] },
  priority: { type: String, enum: ['Low', 'Meduim', 'High'] },
  dueDate: { type: Date, required: false },
  milestones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: { type: Date, default: Date.now },
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
