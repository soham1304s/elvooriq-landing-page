const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');
const authorize = require('../middlewares/rbac');

// Personnel routes restricted to ADMIN
router.get('/', authorize(['ADMIN']), personnelController.getPersonnel);
router.post('/', authorize(['ADMIN']), personnelController.createEmployee);
router.put('/:userId', authorize(['ADMIN']), personnelController.updateEmploymentRecord);

module.exports = router;
