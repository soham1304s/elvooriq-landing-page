const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authorize = require('../middlewares/rbac');

// User Management & Security Gatekeeper
router.get('/users', authorize(['ADMIN']), adminController.getAllUsers);
router.put('/users/:id/activate', authorize(['ADMIN']), adminController.activateUser);
router.delete('/users/:id', authorize(['ADMIN']), adminController.deleteUser);

// Monthly Quality Performance Reports (EPS)
router.get('/reports/monthly', authorize(['ADMIN']), adminController.getMonthlyReport);

// Partner Requests
router.post('/partner-requests', adminController.createPartnerRequest);
router.get('/partner-requests', adminController.getPartnerRequests);
router.get('/partner-requests/:id', adminController.getPartnerRequestById);
router.put('/partner-requests/:id/status', authorize(['ADMIN']), adminController.updatePartnerRequestStatus);

module.exports = router;
