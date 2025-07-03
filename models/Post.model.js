const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  relatedGoal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  relatedMilestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
  image: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  //   updatedAt: { type: Date },
  //   visibility: {
  //     type: String,
  //     enum: ['public', 'private', 'followers'],
  //     default: 'public',
  //   },
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
