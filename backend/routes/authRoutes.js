// Auth Routes: /api/auth/register and /api/auth/login
// POST endpoints for user registration and login

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login and receive JWT token
router.post('/login', login);

module.exports = router;
