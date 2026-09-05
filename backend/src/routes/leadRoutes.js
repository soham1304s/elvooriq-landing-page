const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authorize = require('../middlewares/rbac');

// Leads routes
router.get('/', authorize(['ADMIN', 'EMPLOYEE']), leadController.getLeads);
router.post('/', authorize(['ADMIN', 'EMPLOYEE']), leadController.createLead);

// Lead Fail-Safe Queue & Redistribution Routes (v4.0 Wireframe D)
router.get('/queue/all', authorize(['ADMIN', 'EMPLOYEE']), leadController.getLeadQueue);
router.post('/queue/force-redistribute', authorize(['ADMIN']), leadController.forceRedistribute);
router.post('/queue/reroute-offline', authorize(['ADMIN']), leadController.rerouteOffline);

router.put('/:id', authorize(['ADMIN', 'EMPLOYEE']), leadController.updateLead);
router.delete('/:id', authorize(['ADMIN']), leadController.deleteLead);

module.exports = router;
