const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/rbac');
const { getCreatorGrowthForecast, seedCreatorStreams } = require('../controllers/analyticsController');

router.get('/creator/:id/forecast', authorize(['ADMIN', 'EMPLOYEE', 'CREATOR']), getCreatorGrowthForecast);
router.post('/creator/:id/seed-streams', authorize(['ADMIN', 'EMPLOYEE']), seedCreatorStreams);

module.exports = router;
