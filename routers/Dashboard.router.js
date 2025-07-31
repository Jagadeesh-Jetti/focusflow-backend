const express = require('express');
const DashboardRouter = express.Router();
const {
  getStats,
  getProgress,
  getDeadlines,
  getHistory,
} = require('../controllers/dashboardController');
const protectRoute = require('../middlewares/authMiddleware');

DashboardRouter.get('/stats', protectRoute, getStats);
DashboardRouter.get('/progress', protectRoute, getProgress);
DashboardRouter.get('/deadlines', protectRoute, getDeadlines);
DashboardRouter.get('/history', protectRoute, getHistory);

module.exports = DashboardRouter;
