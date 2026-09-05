const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authorize = require('../middlewares/rbac');

// Tasks accessible by ADMIN and EMPLOYEE
router.get('/', authorize(['ADMIN', 'EMPLOYEE']), taskController.getTasks);
router.get('/tasks', authorize(['ADMIN', 'EMPLOYEE']), taskController.getTasks);

// Production Task Assignment via DB Transaction (v8.0)
router.post('/assign', authorize(['ADMIN']), taskController.createAndAssignTask);
router.post('/', authorize(['ADMIN', 'EMPLOYEE']), taskController.createTask);

// Task status transitions and progress commits
router.patch('/:id/status', authorize(['ADMIN', 'EMPLOYEE']), taskController.updateTaskStatus);
router.put('/:id/progress', authorize(['ADMIN', 'EMPLOYEE']), taskController.updateProgress);
router.post('/:id/progress', authorize(['ADMIN', 'EMPLOYEE']), taskController.updateProgress);
router.put('/tasks/:id/progress', authorize(['ADMIN', 'EMPLOYEE']), taskController.updateProgress);

// Daily work log submissions
router.post('/worklog', authorize(['ADMIN', 'EMPLOYEE']), taskController.submitWorkLog);

module.exports = router;
