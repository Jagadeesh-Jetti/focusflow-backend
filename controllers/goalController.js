const axios = require('axios');
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

const generatePlan = async (req, res) => {
  const { goalTitle, goalDescription } = req.body;

  if (!goalTitle) {
    return res.status(400).json({ message: 'Goal title is required' });
  }

  try {
    const cohereResponse = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        message: `Break down the goal "${goalTitle}" into a valid JSON object ONLY. Do NOT include any explanation.

Return only this format (pure JSON):
{
  "goal": "string",
  "category": "Beginner | Intermediate | Advanced",
  "milestones": [
    {
      "title": "string",
      "tasks": ["task 1", "task 2", "task 3"]
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

    let content = cohereResponse.data.text || cohereResponse.data.generation;
    let cleanContent = content.trim();

    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent
        .replace(/```(json)?/g, '')
        .replace(/```$/, '')
        .trim();
    }

    let plan;
    try {
      plan = JSON.parse(cleanContent);
      plan.description = goalDescription;
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Invalid AI response', raw: cleanContent });
    }

    res.status(200).json(plan);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Cohere API failed', error: error.message });
  }
};

const saveAIPlan = async (req, res) => {
  try {
    console.log('this is reqbody from saveaiplan', req.body);
    const { goal, category, description, milestones } = req.body;
    const userId = req.user._id;

    // 1. Create the Goal
    const newGoal = new Goal({
      user: userId,
      title: goal,
      description,
      category,
    });
    await newGoal.save();

    const milestoneIds = [];

    // 2. Loop through milestones
    for (const m of milestones) {
      const taskIds = [];

      // 3. Loop through tasks inside the milestone
      for (const taskTitle of m.tasks) {
        const task = new Task({
          title: taskTitle,
          description: taskTitle,
          user: userId,
          milestone: null, // temporarily null
        });
        await task.save();
        taskIds.push(task._id);
      }

      // 4. Create the milestone
      const milestone = new Milestone({
        user: userId,
        goal: newGoal._id,
        title: m.title,
        description: m.title,
        targetDate: new Date(), // you can customize this later
        tasks: taskIds,
      });
      await milestone.save();
      milestoneIds.push(milestone._id);

      // 5. Update tasks with their milestone ID
      await Task.updateMany(
        { _id: { $in: taskIds } },
        { $set: { milestone: milestone._id } }
      );
    }

    // 6. Add all milestone IDs to the goal
    newGoal.milestones = milestoneIds;
    await newGoal.save();

    res.status(201).json({
      message: 'AI goal, milestones, and tasks saved successfully',
      goal: newGoal,
    });
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
