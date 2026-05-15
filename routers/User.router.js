const express = require('express');
const {
  getAllUsers,
  getUserProfile,
  getFollowers,
  getFollowing,
  updateUserProfile,
  followUser,
  unfollowUser,
  exportMyData,
  deleteMyAccount,
} = require('../controllers/userController');
const protectRoute = require('../middlewares/authMiddleware');

const UserRouter = express.Router();

UserRouter.get('/all', protectRoute, getAllUsers);
UserRouter.get('/me/export', protectRoute, exportMyData);
UserRouter.delete('/me', protectRoute, deleteMyAccount);
UserRouter.get('/:id/profile', protectRoute, getUserProfile);
UserRouter.get('/:id/followers', protectRoute, getFollowers);
UserRouter.get('/:id/following', protectRoute, getFollowing);
UserRouter.put('/:id/update', protectRoute, updateUserProfile);
UserRouter.post('/:id/follow', protectRoute, followUser);
UserRouter.post('/:id/unfollow', protectRoute, unfollowUser);

module.exports = UserRouter;
