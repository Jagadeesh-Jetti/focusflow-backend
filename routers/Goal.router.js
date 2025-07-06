const express = require('express');
const {
  getGoals,
  createGoal,
  updateGoalById,
  getGoalById,
  deleteGoalById,
  generatePlan,
  saveAIPlan,
} = require('../controllers/goalController');
const protectRoute = require('../middlewares/authMiddleware');
const GoalRouter = express.Router();

GoalRouter.get('/', protectRoute, getGoals);
GoalRouter.post('/', protectRoute, createGoal);
GoalRouter.get('/:id', protectRoute, getGoalById);
GoalRouter.put('/:id', protectRoute, updateGoalById);
GoalRouter.delete('/:id', protectRoute, deleteGoalById);
GoalRouter.post('/generate-plan', protectRoute, generatePlan);
GoalRouter.post('/save-ai-plan', protectRoute, saveAIPlan);

module.exports = GoalRouter;
