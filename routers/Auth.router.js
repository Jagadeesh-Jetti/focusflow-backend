const express = require('express');
const {
  registerUser,
  loginUser,
  getUsers,
} = require('../controllers/authController');
const AuthRouter = express.Router();

AuthRouter.post('/register', registerUser);
AuthRouter.post('/login', loginUser);

module.exports = AuthRouter;
