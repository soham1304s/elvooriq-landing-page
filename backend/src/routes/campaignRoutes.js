const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/rbac');
const {
  getCampaigns,
  createCampaign,
  submitMilestoneProof,
  resolveMilestone,
  seedMockCampaigns
} = require('../controllers/campaignController');

// All campaign routes accessible by ADMIN and EMPLOYEE
router.get('/', authorize(['ADMIN', 'EMPLOYEE']), getCampaigns);
router.post('/create', authorize(['ADMIN', 'EMPLOYEE']), createCampaign);
router.post('/milestone/:id/submit', authorize(['ADMIN', 'EMPLOYEE', 'CREATOR']), submitMilestoneProof);
router.post('/milestone/:id/resolve', authorize(['ADMIN', 'EMPLOYEE']), resolveMilestone);
router.post('/seed-mock', authorize(['ADMIN', 'EMPLOYEE']), seedMockCampaigns);

module.exports = router;
