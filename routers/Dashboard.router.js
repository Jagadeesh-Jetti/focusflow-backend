const express = require('express');
const router = express.Router();
const {
  getState,
  getProgress,
  getDeadlines,
  getHistory,
} = require('../controllers/dashboard.controller');
const { getStats } = require('../controllers/dashboardController');

router.get('/stats', getStats);
router.get('/progress', getProgress);
router.get('/deadlines', getDeadlines);
router.get('/history', getHistory);

module.exports = router;
