const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/rbac');
const { submitChannelAudit, getCreatorAudits, getAllAudits } = require('../controllers/auditController');

router.post('/submit', authorize(['ADMIN', 'EMPLOYEE']), submitChannelAudit);
router.get('/creator/:creatorId', authorize(['ADMIN', 'EMPLOYEE', 'CREATOR']), getCreatorAudits);
router.get('/', authorize(['ADMIN', 'EMPLOYEE']), getAllAudits);

module.exports = router;
