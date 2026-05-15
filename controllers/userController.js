const User = require('../models/User.model');
const Goal = require('../models/Goal.model');
const Milestone = require('../models/Milestone.model');
const Task = require('../models/Task.model');
const Post = require('../models/Post.model');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ message: 'Users retrieved successfully', users });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving users', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId)
      .select('-password')
      .populate('followers', 'name profilePic')
      .populate('following', 'name profilePic')
      .populate('posts', 'content createdAt')
      .populate('goals', 'title status');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User retrieved successfully', user });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving profile', error: error.message });
  }
};

const ALLOWED_PROFILE_FIELDS = [
  'name',
  'bio',
  'location',
  'profilePic',
  'bannerPic',
];

const updateUserProfile = async (req, res) => {
  const userId = req.params.id;

  if (String(userId) !== String(req.user._id)) {
    return res
      .status(403)
      .json({ message: 'You can only update your own profile' });
  }

  const updatedData = {};
  for (const field of ALLOWED_PROFILE_FIELDS) {
    if (req.body[field] !== undefined) {
      updatedData[field] = req.body[field];
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res
      .status(200)
      .json({ message: 'User profile updated successfully', updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating user', error: error.message });
  }
};

const followUser = async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  try {
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    if (
      currentUser.following.map((id) => id.toString()).includes(targetUserId)
    ) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error following user', error: error.message });
  }
};

const unfollowUser = async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!targetUser.followers.includes(currentUserId)) {
      return res
        .status(400)
        .json({ message: 'You are not following this user' });
    }

    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error unfollowing user', error: error.message });
  }
};

const getFollowers = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).populate(
      'followers',
      'name profilePic'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Followers retrieved successfully',
      followers: user.followers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving followers', error: error.message });
  }
};

const getFollowing = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).populate(
      'following',
      'name profilePic'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res
      .status(200)
      .json({ message: 'Following list retrieved', following: user.following });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving following list',
      error: error.message,
    });
  }
};

// Export all of the current user's data as JSON
const exportMyData = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');
    const goals = await Goal.find({ user: userId });
    const milestones = await Milestone.find({ user: userId });
    const tasks = await Task.find({ user: userId });
    const posts = await Post.find({ user: userId });
    const exportedAt = new Date().toISOString();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="focusflow-export-${Date.now()}.json"`
    );
    res.status(200).json({
      exportedAt,
      user,
      goals,
      milestones,
      tasks,
      posts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error exporting data', error: error.message });
  }
};

// Permanently delete the authenticated user + all their content
const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await Task.deleteMany({ user: userId });
    await Milestone.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });
    await Post.deleteMany({ user: userId });
    // Remove this user from others' followers / following lists
    await User.updateMany(
      { $or: [{ followers: userId }, { following: userId }] },
      { $pull: { followers: userId, following: userId } }
    );
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting account', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  exportMyData,
  deleteMyAccount,
};
