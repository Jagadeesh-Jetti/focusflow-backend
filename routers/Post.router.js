const express = require('express');
const multer = require('multer');
const upload = require('../middlewares/upload');

const protectRoute = require('../middlewares/authMiddleware');
const {
  createPost,
  getPosts,
  getPostById,
  toggleLikePost,
  commentPost,
  deletePost,
} = require('../controllers/postController');
const Post = require('../models/Post.model');

const PostRouter = express.Router();

PostRouter.get('/', protectRoute, getPosts);
PostRouter.post('/', protectRoute, upload.single('image'), createPost);
PostRouter.get('/:id', protectRoute, getPostById);
PostRouter.patch('/:id/like', protectRoute, toggleLikePost);
PostRouter.post('/:id/comment', protectRoute, commentPost);
PostRouter.delete('/:id', protectRoute, deletePost);

module.exports = PostRouter;
