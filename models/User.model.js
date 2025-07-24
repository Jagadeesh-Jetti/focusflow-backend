const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePic: { type: String, default: '' },
  bannerPic: { type: String, default: '' },
  password: { type: String, required: true },

  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  likes: { type: Number, dafault: 0 },

  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
