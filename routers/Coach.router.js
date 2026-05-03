const express = require('express');
const protectRoute = require('../middlewares/authMiddleware');
const { chat } = require('../controllers/coachController');

const CoachRouter = express.Router();

CoachRouter.post('/chat', protectRoute, chat);

module.exports = CoachRouter;
