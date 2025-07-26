const mongoose = require('mongoose');
const Task = require('../models/Task.model');

const createTask = async (req, res) => {
  const { milestone, goal, title, description, dueDate, priority, status } =
    req.body;

  if (!title || !description || !dueDate || !priority) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const task = await Task.create({
      milestone,
      goal,
      title,
      description,
      dueDate,
      priority,
      status,
      completedAt: status === 'completed' ? new Date() : null,
      user: req.user._id,
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error while creating task', error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id })
      .populate('goal')
      .populate('milestone');
    res.status(200).json({ message: 'Tasks retrieved successfully', tasks });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error while retrieving tasks', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  const taskId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid Task ID' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task retrieved successfully', task });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error while retrieving task', error: error.message });
  }
};

const updateTaskById = async (req, res) => {
  const taskId = req.params.id;
  const updatedData = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid Task ID' });
  }

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (updatedData.status) {
      if (updatedData.status === 'completed') {
        updatedData.completedAt = new Date();
      } else if (
        task.status === 'completed' &&
        updatedData.status !== 'completed'
      ) {
        updatedData.completedAt = null;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updatedData, {
      new: true,
    });

    res
      .status(200)
      .json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error while updating task', error: error.message });
  }
};

const deleteTaskById = async (req, res) => {
  const taskId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid Task ID' });
  }

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res
      .status(200)
      .json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error while deleting task', error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
};
