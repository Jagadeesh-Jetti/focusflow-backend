const mongoose = require('mongoose');

const Goal = require('../models/Goal.model');
const Milestone = require('../models/Milestone.model');
const Task = require('../models/Task.model');

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
      user: req.user._id,
    });

    res.status(201).json({
      message: 'Goal created successfully',
      goal,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error while creating goal',
      error: err.message,
    });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).populate({
      path: 'milestones',
      populate: { path: 'tasks' },
    });
    res.status(200).json({ message: 'Goals retrieved successfully', goals });
  } catch (err) {
    res.status(500).json({
      message: 'Error while retrieving goals',
      error: err.message,
    });
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

const axios = require('axios');

const generatePlan = async (req, res) => {
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ message: 'Goal title is required' });
  }

  try {
    const cohereResponse = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        message: `Break down the goal "${goal}" into 2 milestones, each with 3 tasks. Return JSON like:
{
  goal: "string",
  category: "string",
  milestones: [
    {
      title: "string",
      tasks: ["task1", "task2", "task3"]
    }
  ]
}`,
        chat_history: [],
        connectors: [],
        temperature: 0.3,
        model: 'command-light',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = cohereResponse.data.text || cohereResponse.data.generation;
    const plan = JSON.parse(content);
    res.status(200).json(plan);
  } catch (error) {
    console.error('Cohere API Error:', error.message);
    res
      .status(500)
      .json({ message: 'Cohere API failed', error: error.message });
  }
};

const saveAIPlan = async (req, res) => {
  try {
    const { goal, category, milestones } = req.body;
    const userId = req.user._id;

    const newGoal = new Goal({
      user: userId,
      title: goal,
      description: goal,
      category,
    });
    await newGoal.save();

    const milestoneIds = [];

    for (const m of milestones) {
      const taskIds = [];

      for (const taskTitle of m.tasks) {
        const task = new Task({
          milestone: null,
          user: userId,
          title: taskTitle,
          description: taskTitle,
        });

        await task.save();
        taskIds.push(task._id);
      }

      const milestone = new Milestone({
        goal: newGoal._id,
        user: userId,
        title: m.title,
        description: m.title,
        targetDate: new Date(),
        tasks: taskIds,
      });

      await milestone.save();
      milestoneIds.push(milestone._id);

      await Task.updateMany(
        { _id: { $in: taskIds } },
        { $set: { milestone: milestone._id } }
      );
    }

    newGoal.milestones = milestoneIds;
    await newGoal.save();

    res.status(201).json({ message: 'AI goal saved successfully' });
  } catch (err) {
    console.error('❌ Error saving AI goal:', err);
    res.status(500).json({ error: 'Failed to save AI goal' });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoalById,
  deleteGoalById,
  generatePlan,
  saveAIPlan,
};
