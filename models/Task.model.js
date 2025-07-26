const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: false,
    },
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date },
    completedAt: { type: Date, default: null },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

taskSchema.pre('save', function (next) {
  if (this.isModified('isCompleted')) {
    if (this.isCompleted && !this.completedAt) {
      this.completedAt = new Date();
    } else if (!this.isCompleted && this.completedAt) {
      this.completedAt = undefined;
    }
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
