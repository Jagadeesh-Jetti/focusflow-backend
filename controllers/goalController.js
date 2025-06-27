const mongoose = require('mongoose');
const Goal = require('../models/Goal.model');

const createGoal = async (req, res) => {
  const { title, description, category, milestones } = req.body;

  try {
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const goal = await Goal.create({
      title,
      description,
      category,
      milestones,
    });

    res.status(201).json({
      message: 'Goal created successfully',
      goal,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error while retrieving goals', error: err.message });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find();
    res.status(200).json({ message: 'Goals retrieved successfully', goals });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error while retrieving goals', error: err.message });
  }
};

const getGoalById = async (req, res) => {
  const goalId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return res.status(400).json({ message: 'Invalid goal ID' });
  }

  try {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(200).json({
      message: 'Goal retrieved successfully',
      goal,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error while retrieving goal by ID',
      error: error.message,
    });
  }
};

const updateGoalById = async (req, res) => {
  const goalId = req.params.id;
  const updatedData = req.body;

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return res.status(400).json({ message: 'Invalid Goal ID' });
  }

  try {
    const updatedGoal = await Goal.findByIdAndUpdate(goalId, updatedData, {
      new: true,
    });

    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(200).json({
      message: 'Goal updated successfully',
      goal: updatedGoal,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error while updating the goal',
      error: error.message,
    });
  }
};

const deleteGoalById = async (req, res) => {
  const goalId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return res.status(400).json({ message: 'Invalid Goal ID' });
  }

  try {
    const goalDeleted = await Goal.findByIdAndDelete(goalId);

    if (!goalDeleted) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(200).json({
      message: 'Goal deleted successfully',
      goal: goalDeleted,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error while deleting the goal',
      error: error.message,
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoalById,
  deleteGoalById,
};
