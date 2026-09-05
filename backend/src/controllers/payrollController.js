const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Enterprise Payroll Ledger Orchestrator (v4.0)
 */
class PayrollController {
  /**
   * Retrieves all payroll records or filters by billing period
   */
  static async getPayrollLedger(req, res) {
    try {
      const billingPeriod = req.query.billingPeriod || req.query.period;
      const where = billingPeriod ? { billingPeriod } : {};

      const ledger = await prisma.payrollLedger.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              status: true
            }
          },
          disbursement: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = ledger.map(l => ({
        ...l,
        status: l.approvalStatus,
        netSalary: l.netPay,
        period: l.billingPeriod,
        employee: l.user
      }));

      return res.status(200).json({ success: true, ledger, payrolls: formatted, count: ledger.length });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch payroll records.', error: err.message });
    }
  }

  /**
   * Generates a monthly draft payroll batch based on employee offer letter contracts
   */
  static async generateMonthlyDraftLedger(req, res) {
    try {
      const billingPeriod = req.body.billingPeriod || req.body.period; // e.g. "2026-09" or "September 2026"
      if (!billingPeriod) {
        return res.status(400).json({ success: false, message: 'Billing period is required (e.g. "2026-09").' });
      }

      // Check if ledger already exists for this period
      const existingLedger = await prisma.payrollLedger.findFirst({
        where: { billingPeriod }
      });
      if (existingLedger) {
        const existingRecords = await prisma.payrollLedger.findMany({
          where: { billingPeriod },
          include: {
            user: { select: { id: true, fullName: true, email: true, role: true, status: true } },
            disbursement: true
          }
        });
        const formatted = existingRecords.map(l => ({
          ...l,
          status: l.approvalStatus,
          netSalary: l.netPay,
          period: l.billingPeriod,
          employee: l.user
        }));
        return res.status(200).json({ 
          success: true, 
          message: `Payroll ledger for [${billingPeriod}] already exists.`,
          ledger: existingRecords,
          payrolls: formatted,
          count: existingRecords.length
        });
      }

      // Get all active employees with contracts
      const employees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE', status: 'ACTIVE', isEnabled: true },
        include: { employmentRecord: true }
      });

      if (employees.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No active employees found to compile payroll ledger.' 
        });
      }

      const ledgerEntries = [];

      for (const emp of employees) {
        const base = emp.employmentRecord ? emp.employmentRecord.baseSalary : 50000.0;
        const currency = emp.employmentRecord ? emp.employmentRecord.currency : 'INR';

        // Initialize draft ledger sheet
        const ledgerEntry = await prisma.payrollLedger.create({
          data: {
            userId: emp.id,
            billingPeriod,
            baseSalary: base,
            allowances: 0.0,
            deductions: 0.0,
            netPay: base, // Base starting point
            currency,
            approvalStatus: 'DRAFT'
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                status: true
              }
            }
          }
        });
        ledgerEntries.push(ledgerEntry);
      }

      return res.status(201).json({
        success: true,
        message: `Successfully compiled [${ledgerEntries.length}] draft payroll records for ${billingPeriod}.`,
        ledger: ledgerEntries
      });

    } catch (err) {
      return res.status(500).json({ success: false, message: 'Draft payroll generation failed.', error: err.message });
    }
  }

  /**
   * Updates allowances or deductions in draft sheets
   */
  static async updatePayrollAdjustments(req, res) {
    try {
      const { ledgerId } = req.params;
      const { allowances, deductions } = req.body;

      const ledger = await prisma.payrollLedger.findUnique({
        where: { id: ledgerId }
      });

      if (!ledger || ledger.approvalStatus !== 'DRAFT') {
        return res.status(400).json({ 
          success: false, 
          message: 'Ledger record not found or already approved/disbursed.' 
        });
      }

      const updatedAllowances = allowances !== undefined ? parseFloat(allowances) : ledger.allowances;
      const updatedDeductions = deductions !== undefined ? parseFloat(deductions) : ledger.deductions;
      const netPay = (ledger.baseSalary + updatedAllowances) - updatedDeductions;

      const updatedLedger = await prisma.payrollLedger.update({
        where: { id: ledgerId },
        data: {
          allowances: updatedAllowances,
          deductions: updatedDeductions,
          netPay,
          approvalStatus: 'APPROVED',
          approvedById: req.user ? req.user.id : null
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          },
          disbursement: true
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Payroll adjustment committed and approved.',
        ledger: updatedLedger
      });

    } catch (err) {
      return res.status(500).json({ success: false, message: 'Adjustment commit failed.', error: err.message });
    }
  }

  /**
   * Approves a payroll ledger for disbursement
   */
  static async approvePayroll(req, res) {
    try {
      const { ledgerId } = req.params;
      const updatedLedger = await prisma.payrollLedger.update({
        where: { id: ledgerId },
        data: {
          approvalStatus: 'APPROVED',
          approvedById: req.user ? req.user.id : null
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          },
          disbursement: true
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Payroll ledger approved for disbursement.',
        ledger: updatedLedger
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Approval failed.', error: err.message });
    }
  }

  /**
   * Executes disbursement and generates transaction logs
   */
  static async disbursePayroll(req, res) {
    try {
      const { ledgerId } = req.params;
      const { paymentMethod, method, transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({ success: false, message: 'Transaction ID is required to log disbursements.' });
      }

      const ledger = await prisma.payrollLedger.findUnique({
        where: { id: ledgerId }
      });

      if (!ledger || (ledger.approvalStatus !== 'APPROVED' && ledger.approvalStatus !== 'DRAFT')) {
        return res.status(400).json({ success: false, message: 'Ledger must be in APPROVED or valid status before executing disbursements.' });
      }

      // Execute disbursement creation as a transaction
      const [updatedLedger, disbursement] = await prisma.$transaction([
        prisma.payrollLedger.update({
          where: { id: ledgerId },
          data: { approvalStatus: 'DISBURSED' }
        }),
        prisma.payrollDisbursement.create({
          data: {
            ledgerId,
            userId: ledger.userId,
            paidAmount: ledger.netPay,
            currency: ledger.currency,
            transactionId,
            paymentMethod: paymentMethod || method || 'BANK_TRANSFER'
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        message: 'Payroll disbursement executed successfully.',
        ledger: updatedLedger,
        disbursement
      });

    } catch (err) {
      return res.status(500).json({ success: false, message: 'Payroll disbursement transaction aborted.', error: err.message });
    }
  }
}

module.exports = PayrollController;
