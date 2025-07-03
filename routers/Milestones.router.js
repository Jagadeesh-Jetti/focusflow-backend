const express = require('express');
const {
  getMilestones,
  createMilestone,
  getMilestoneById,
  updateMilestoneById,
  deleteMilestoneById,
} = require('../controllers/milestoneController');
const protectRoute = require('../middlewares/authMiddleware');

const MilestoneRouter = express.Router();

MilestoneRouter.get('/', protectRoute, getMilestones);
MilestoneRouter.post('/', protectRoute, createMilestone);
MilestoneRouter.get('/:id', protectRoute, getMilestoneById);
MilestoneRouter.put('/:id', protectRoute, updateMilestoneById);
MilestoneRouter.delete('/:id', protectRoute, deleteMilestoneById);

module.exports = MilestoneRouter;
