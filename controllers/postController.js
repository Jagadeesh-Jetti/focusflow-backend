const Post = require('../models/Post.model');

export const createPost = async (postData) => {
  const { content, relatedGoal, relatedMilestone, image } = postData;

  if (!content || !image) {
    return res.status(404).json({ message: 'Input fields missing' });
  }

  try {
    const post = await Post.create({
      user: req.user._id,
      content,
      image,
      relatedGoal,
      relatedMilestone,
    });

    res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error creating post', error: err.message });
  }
};

export const GetPosts = async (req, res) => {
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

export const getPostById = async (req, res) => {
  const { id } = req.params;

  const checkId = mongoose.Schema.Types.ObjectId.isValid(id);
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

export const toggleLikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.params._id;

  try {
    const post = await Post.findById(postId);

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
    res.status(200).json({ message: alreadyLiked ? 'Unliked' : 'Liked', post });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error while toggling like', error: err.message });
  }
};

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  if (!comment) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, comment });
    await post.save();

    res.status(200).json({ message: 'Comment added successfully', post });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error while adding comment', error: err.message });
  }
};

export const deletePost = async (req, res) => {
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
