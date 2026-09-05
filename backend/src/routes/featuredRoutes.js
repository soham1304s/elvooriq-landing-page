const express = require('express');
const router = express.Router();
const featuredController = require('../controllers/featured.controller');

router.get('/video', featuredController.getFeaturedVideo);
router.get('/videos', featuredController.getFeaturedVideos);
router.post('/video', featuredController.updateFeaturedVideo);
router.delete('/video', featuredController.removeFeaturedVideo);
router.delete('/videos/:id', featuredController.removeFeaturedVideoById);

module.exports = router;
