const express = require('express');
const protectRoute = require('../middlewares/authMiddleware');
const {
  createPost,
  GetPosts,
  getPostById,
  toggleLikePost,
  commentPost,
  deletePost,
} = require('../controllers/postController');
const Post = require('../models/Post.model');

const PostRouter = express.Router();

PostRouter.get('/', protectRoute, GetPosts);
PostRouter.post('/', protectRoute, createPost);
PostRouter.get('/:id', protectRoute, getPostById);
PostRouter.post('/:id', protectRoute, toggleLikePost);
PostRouter.put('/:id', protectRoute, commentPost);
PostRouter.delete('/:id', protectRoute, deletePost);

module.exports = PostRouter;
