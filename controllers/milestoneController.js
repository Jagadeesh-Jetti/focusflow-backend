const mongoose = require('mongoose');
const Milestone = require('../models/Milestone.model');

const createMilestone = async (req, res) => {
  const { goal, title, description, targetDate, tasks } = req.body;

  if (!title || !description || !targetDate) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const milestone = await Milestone.create({
      goal,
      title,
      description,
      targetDate,
      tasks,
    });

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
    const milestones = await Milestone.find().populate('goal');
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
    const milestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      updatedData,
      { new: true }
    );
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

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
    const milestone = await Milestone.findByIdAndDelete(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    res
      .status(200)
      .json({ message: 'Milestone deleted successfully', milestone });
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
