const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authorize = require('../middlewares/rbac');

// Authentication Session & Conversational Gate
router.post('/start', authController.startSession);
router.post('/save-progress', authController.saveProgress);

// Core Authentication & Session Lifecycle
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authorize(), authController.getMe);

// Session History & Telemetry
router.get('/sessions', authorize(), authController.getUserSessions);
router.post('/heartbeat', authController.sessionHeartbeat);
router.get('/admin/sessions', authorize(['ADMIN']), authController.getAllSessions);

module.exports = router;
