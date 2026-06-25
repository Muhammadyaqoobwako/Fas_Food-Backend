const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { validateLogin } = require('../middleware/validateMiddleware');

router.post('/register', validateLogin, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
