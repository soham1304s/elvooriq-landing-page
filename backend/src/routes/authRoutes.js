const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/start', authController.startSession);
router.post('/save-progress', authController.saveProgress);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
