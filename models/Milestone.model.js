const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: 'Target date must be in the future.',
      },
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Milestone = mongoose.model('Milestone', milestoneSchema);
module.exports = Milestone;
