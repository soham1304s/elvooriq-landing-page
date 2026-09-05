const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authorize = require('../middlewares/rbac');

// Public or creator-authenticated portfolio lookup
router.get('/portfolio/:userId', githubController.getPortfolioByUserId);

// Authenticated GitHub profile linking and live sync
router.post('/link', authorize(), githubController.linkGithubProfile);
router.post('/sync', authorize(), githubController.syncGithubPortfolio);

module.exports = router;
