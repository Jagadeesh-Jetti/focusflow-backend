const User = require('../models/User.model');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
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

const updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

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

    if (currentUser.following.includes(targetUserId)) {
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

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
