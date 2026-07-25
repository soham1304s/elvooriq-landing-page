const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// All routes here should be protected by an admin middleware ideally.
// For now, we will add the /users endpoint.
router.get('/users', adminController.getAllUsers);

// Partner Requests
router.post('/partner-requests', adminController.createPartnerRequest);
router.get('/partner-requests', adminController.getPartnerRequests);
router.get('/partner-requests/:id', adminController.getPartnerRequestById);
router.put('/partner-requests/:id/status', adminController.updatePartnerRequestStatus);

module.exports = router;
