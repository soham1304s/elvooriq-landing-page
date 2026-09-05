const express = require('express');
const router = express.Router();
const liveController = require('../controllers/live.controller');

// Settings
router.get('/settings', liveController.getSettings);

// YouTube Integration
router.get('/youtube/auth', liveController.connectYouTube);
router.get('/youtube/callback', liveController.youtubeCallback);

// Stream Lifecycle
router.post('/create-broadcast', liveController.createBroadcast);
router.post('/start', liveController.startStream);
router.post('/stop', liveController.stopStream);
router.get('/status/:sessionId', liveController.getStatus);

module.exports = router;
