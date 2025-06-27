const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTaskById,
  deleteTaskById,
} = require('../controllers/taskController');

const TaskRouter = express.Router();

TaskRouter.get('/', getTasks);
TaskRouter.get('/:id', getTaskById);
TaskRouter.post('/', createTask);
TaskRouter.put('/:id', updateTaskById);
TaskRouter.delete('/:id', deleteTaskById);

module.exports = TaskRouter;
