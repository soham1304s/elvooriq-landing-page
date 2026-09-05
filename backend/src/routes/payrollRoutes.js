const express = require('express');
const router = express.Router();
const PayrollController = require('../controllers/payrollController');
const authorize = require('../middlewares/rbac');

// Ledger Retrieval & Filtering
router.get('/ledger', authorize(['ADMIN']), PayrollController.getPayrollLedger);
router.get('/period', authorize(['ADMIN']), PayrollController.getPayrollLedger);

// Generate Monthly Draft Ledger Batch
router.post('/generate-draft', authorize(['ADMIN']), PayrollController.generateMonthlyDraftLedger);

// Commit Allowances / Deductions Adjustments & Approve
router.put('/:ledgerId/adjust', authorize(['ADMIN']), PayrollController.updatePayrollAdjustments);
router.put('/:ledgerId/approve', authorize(['ADMIN']), PayrollController.approvePayroll);

// Execute Disbursement
router.post('/:ledgerId/disburse', authorize(['ADMIN']), PayrollController.disbursePayroll);

module.exports = router;
