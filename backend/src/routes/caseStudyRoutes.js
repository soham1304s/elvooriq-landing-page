const express = require('express');
const router = express.Router();
const caseStudyController = require('../controllers/caseStudyController');

router.get('/', caseStudyController.getCaseStudies);

module.exports = router;
