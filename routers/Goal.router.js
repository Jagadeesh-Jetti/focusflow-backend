const express = require('express');
const {
  getGoals,
  createGoal,
  updateGoalById,
  getGoalById,
  deleteGoalById,
} = require('../controllers/goalController');

const GoalRouter = express.Router();

GoalRouter.get('/', getGoals);
GoalRouter.post('/', createGoal);
GoalRouter.get('/:id', getGoalById);
GoalRouter.put('/:id', updateGoalById);
GoalRouter.delete('/:id', deleteGoalById);

module.exports = GoalRouter;
