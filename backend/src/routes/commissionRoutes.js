const express = require('express');
const router = express.Router();
const multer = require('multer');
const authorize = require('../middlewares/rbac');
const { ingestPlatformEarningsCSV, getRevenueSplits, syncSplitToPayroll } = require('../controllers/commissionController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Admin endpoints for platform commission splits
router.post('/ingest-splits', authorize(['ADMIN']), upload.single('statement'), ingestPlatformEarningsCSV);
router.get('/splits', authorize(['ADMIN', 'EMPLOYEE']), getRevenueSplits);
router.patch('/splits/:id/sync', authorize(['ADMIN']), syncSplitToPayroll);

module.exports = router;
