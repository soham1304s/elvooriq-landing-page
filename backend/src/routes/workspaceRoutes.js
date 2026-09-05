const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const authorize = require('../middlewares/rbac');

// Workspaces accessible by ADMIN and EMPLOYEE
router.get('/', authorize(['ADMIN', 'EMPLOYEE']), workspaceController.getWorkspaces);
router.get('/:id', authorize(['ADMIN', 'EMPLOYEE']), workspaceController.getWorkspaceById);
router.post('/', authorize(['ADMIN']), workspaceController.createWorkspace);
router.put('/:id', authorize(['ADMIN']), workspaceController.updateWorkspace);
router.delete('/:id', authorize(['ADMIN']), workspaceController.deleteWorkspace);

module.exports = router;
