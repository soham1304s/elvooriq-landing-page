const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/rbac');
const {
  sendLeadOutboundOutreach,
  getLeadWithInteractions,
  getCRMLeads,
  recordInboundMessage
} = require('../controllers/crmController');

// All CRM routes accessible by ADMIN and EMPLOYEE
router.post('/outreach/send', authorize(['ADMIN', 'EMPLOYEE']), sendLeadOutboundOutreach);
router.get('/leads', authorize(['ADMIN', 'EMPLOYEE']), getCRMLeads);
router.get('/leads/:id', authorize(['ADMIN', 'EMPLOYEE']), getLeadWithInteractions);
router.post('/inbound/simulate', authorize(['ADMIN', 'EMPLOYEE']), recordInboundMessage);

module.exports = router;
