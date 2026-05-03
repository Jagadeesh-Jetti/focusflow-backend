const mongoose = require('mongoose');
const Milestone = require('../models/Milestone.model');
const Goal = require('../models/Goal.model');

const createMilestone = async (req, res) => {
  const { goal, title, description, targetDate, tasks } = req.body;

  if (!title || !description || !targetDate || !goal) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  if (!mongoose.Types.ObjectId.isValid(goal)) {
    return res.status(400).json({ message: 'Invalid goal ID' });
  }

  try {
    const parentGoal = await Goal.findById(goal);
    if (!parentGoal) {
      return res.status(404).json({ message: 'Parent goal not found' });
    }
    if (String(parentGoal.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only add milestones to your own goals' });
    }

    const milestone = await Milestone.create({
      goal,
      title,
      description,
      targetDate,
      tasks,
      user: req.user._id,
    });

    parentGoal.milestones = parentGoal.milestones || [];
    if (
      !parentGoal.milestones.some((m) => String(m) === String(milestone._id))
    ) {
      parentGoal.milestones.push(milestone._id);
      await parentGoal.save();
    }

    res
      .status(201)
      .json({ message: 'Milestone created successfully', milestone });
  } catch (error) {
    res.status(500).json({
      message: 'Error while creating milestone',
      error: error.message,
    });
  }
};

const getMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ user: req.user._id }).populate(
      'goal'
    );
    res
      .status(200)
      .json({ message: 'Milestones retrieved successfully', milestones });
  } catch (error) {
    res.status(500).json({
      message: 'Error while retrieving milestones',
      error: error.message,
    });
  }
};

const getMilestoneById = async (req, res) => {
  const milestoneId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
    return res.status(400).json({ message: 'Invalid milestone ID' });
  }

  try {
    const milestone = await Milestone.findById(milestoneId).populate('goal');
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    if (String(milestone.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only view your own milestones' });
    }

    res
      .status(200)
      .json({ message: 'Milestone retrieved successfully', milestone });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error retrieving milestone', error: error.message });
  }
};

const updateMilestoneById = async (req, res) => {
  const milestoneId = req.params.id;
  const updatedData = req.body;

  if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
    return res.status(400).json({ message: 'Invalid milestone ID' });
  }

  try {
    const existing = await Milestone.findById(milestoneId);
    if (!existing) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    if (String(existing.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only update your own milestones' });
    }

    delete updatedData.user;
    delete updatedData.goal;

    const milestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      updatedData,
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({ message: 'Milestone updated successfully', milestone });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating milestone', error: error.message });
  }
};

const deleteMilestoneById = async (req, res) => {
  const milestoneId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(milestoneId)) {
    return res.status(400).json({ message: 'Invalid milestone ID' });
  }

  try {
    const existing = await Milestone.findById(milestoneId);
    if (!existing) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    if (String(existing.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own milestones' });
    }

    if (existing.goal) {
      await Goal.updateOne(
        { _id: existing.goal },
        { $pull: { milestones: existing._id } }
      );
    }

    await existing.deleteOne();

    res
      .status(200)
      .json({ message: 'Milestone deleted successfully', milestone: existing });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting milestone', error: error.message });
  }
};

module.exports = {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestoneById,
  deleteMilestoneById,
};
