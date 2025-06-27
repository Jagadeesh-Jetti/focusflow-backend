const express = require('express');
const {
  getMilestones,
  createMilestone,
  getMilestoneById,
  updateMilestoneById,
  deleteMilestoneById,
} = require('../controllers/milestoneController');

const MilestoneRouter = express.Router();

MilestoneRouter.get('/', getMilestones);
MilestoneRouter.post('/', createMilestone);
MilestoneRouter.get('/:id', getMilestoneById);
MilestoneRouter.put('/:id', updateMilestoneById);
MilestoneRouter.delete('/:id', deleteMilestoneById);

module.exports = MilestoneRouter;
