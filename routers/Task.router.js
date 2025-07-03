const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTaskById,
  deleteTaskById,
} = require('../controllers/taskController');
const protectRoute = require('../middlewares/authMiddleware');

const TaskRouter = express.Router();

TaskRouter.get('/', protectRoute, getTasks);
TaskRouter.get('/:id', protectRoute, getTaskById);
TaskRouter.post('/', protectRoute, createTask);
TaskRouter.put('/:id', protectRoute, updateTaskById);
TaskRouter.delete('/:id', protectRoute, deleteTaskById);

module.exports = TaskRouter;
