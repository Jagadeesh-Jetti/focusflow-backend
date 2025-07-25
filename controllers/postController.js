const Post = require('../models/Post.model');
const mongoose = require('mongoose');

const createPost = async (req, res) => {
  // console.log(req);
  try {
    const { content, relatedGoal, relatedMilestone } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Post content is required.' });
    }

    // console.log('📦 Received file:', req.file?.path || 'No file received');
    // console.log('📝 Content:', req.body.content);

    // ✅ Safely extract Cloudinary URL
    const imageUrl = req.file ? req.file.path : '';

    const post = await Post.create({
      user: req.user._id,
      content,
      image: imageUrl,
      relatedGoal,
      relatedMilestone,
    });

    res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    // console.error('❌ Error creating post:', err);
    res
      .status(500)
      .json({ message: 'Error creating post', error: err.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name email')
      .populate('relatedGoal', 'title')
      .populate('relatedMilestone', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'All posts retrieved', posts });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching posts', error: err.message });
  }
};

const getPostById = async (req, res) => {
  const { id } = req.params;

  const checkId = mongoose.Types.ObjectId.isValid(id);
  if (!checkId) {
    return res.status(404).json({ message: 'Id not found' });
  }
  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found to retrieve' });
    }
    res.status(200).json({ message: 'Post retrieved successfully', post });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching goal by id', error: err.message });
  }
};

const toggleLikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  try {
    let post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    post = await Post.findById(postId)
      .populate('user', 'name')
      .populate('relatedGoal', 'title')
      .populate('relatedMilestone', 'title');

    res.status(200).json({ message: alreadyLiked ? 'Unliked' : 'Liked', post });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error while toggling like', error: err.message });
  }
};

const commentPost = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  if (!comment) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  try {
    let post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, comment });
    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('user', 'name')
      .populate('relatedGoal', 'title')
      .populate('relatedMilestone', 'title')
      .populate('comments.user', 'name'); // important!

    res
      .status(200)
      .json({ message: 'Comment added successfully', post: updatedPost });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error while adding comment', error: err.message });
  }
};

const deletePost = async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return res.status(500).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully', post });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error while deleting comment', error: err.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  toggleLikePost,
  commentPost,
  deletePost,
};
