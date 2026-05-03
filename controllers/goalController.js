const axios = require('axios');
const mongoose = require('mongoose');
const Goal = require('../models/Goal.model');
const Milestone = require('../models/Milestone.model');
const Task = require('../models/Task.model');

const createGoal = async (req, res) => {
  const {
    title,
    description,
    category,
    milestones,
    priority,
    status,
    dueDate,
  } = req.body;

  try {
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const goal = await Goal.create({
      title,
      description,
      category,
      milestones,
      status,
      priority,
      dueDate,
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
    const goal = await Goal.findById(goalId).populate('tasks');

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (String(goal.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only view your own goals' });
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

const getGoalFull = async (req, res) => {
  const goalId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return res.status(400).json({ message: 'Invalid goal ID' });
  }

  try {
    const goal = await Goal.findById(goalId).populate('milestones');

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (String(goal.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only view your own goals' });
    }

    const tasks = await Task.find({ goal: goal._id }).sort({ createdAt: 1 });

    const tasksByMilestone = new Map();
    const unassignedTasks = [];
    for (const task of tasks) {
      if (task.milestone) {
        const key = String(task.milestone);
        if (!tasksByMilestone.has(key)) tasksByMilestone.set(key, []);
        tasksByMilestone.get(key).push(task);
      } else {
        unassignedTasks.push(task);
      }
    }

    const goalObj = goal.toObject();
    goalObj.milestones = goalObj.milestones.map((m) => ({
      ...m,
      tasks: tasksByMilestone.get(String(m._id)) || [],
    }));

    res.status(200).json({
      message: 'Goal retrieved successfully',
      goal: goalObj,
      unassignedTasks,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error while retrieving goal',
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
    const existing = await Goal.findById(goalId);

    if (!existing) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (String(existing.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only update your own goals' });
    }

    delete updatedData.user;

    const updatedGoal = await Goal.findByIdAndUpdate(goalId, updatedData, {
      new: true,
    });

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
    const existing = await Goal.findById(goalId);

    if (!existing) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (String(existing.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own goals' });
    }

    await existing.deleteOne();

    res.status(200).json({
      message: 'Goal deleted successfully',
      goal: existing,
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

  const prompt = `Break down the goal "${goalTitle}" into a valid JSON object ONLY. Do NOT include any explanation.

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
}`;

  try {
    const cohereResponse = await axios.post(
      'https://api.cohere.com/v2/chat',
      {
        model: 'command-r-08-2024',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const contentParts = cohereResponse.data?.message?.content || [];
    const content = contentParts.map((p) => p.text || '').join('').trim();

    if (!content) {
      return res
        .status(502)
        .json({ message: 'AI returned an empty response' });
    }

    let cleanContent = content;
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
        .status(502)
        .json({ message: 'Invalid AI response', raw: cleanContent });
    }

    res.status(200).json(plan);
  } catch (error) {
    const upstream = error.response?.data;
    res.status(502).json({
      message: 'AI plan generation failed',
      error: error.message,
      upstream,
    });
  }
};

const saveAIPlan = async (req, res) => {
  try {
    // console.log('this is reqbody from saveaiplan', req.body);
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
    // console.error('❌ Error saving AI goal:', err);
    res.status(500).json({ error: 'Failed to save AI goal' });
  }
};

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  getGoalFull,
  updateGoalById,
  deleteGoalById,
  generatePlan,
  saveAIPlan,
};
