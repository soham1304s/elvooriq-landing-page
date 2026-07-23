const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// All routes here should be protected by an admin middleware ideally.
// For now, we will add the /users endpoint.
router.get('/users', adminController.getAllUsers);

module.exports = router;
