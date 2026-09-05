const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authorize = require('../middlewares/rbac');
const { generateContractTemplate, executeLegalContractSignature } = require('../services/legalContractEngine');

/**
 * POST /api/legal/generate
 * Generates an onboarding contract draft with jurisdictional tax rules
 */
router.post('/generate', authorize(['ADMIN', 'EMPLOYEE']), async (req, res) => {
  try {
    const {
      employeeName,
      jobTitle,
      baseSalary,
      currency,
      country,
      signeeEmail,
      signeeId
    } = req.body;

    if (!employeeName || !jobTitle) {
      return res.status(400).json({ success: false, message: 'Employee name and job title are required' });
    }

    const { contractNumber, taxForm, taxWithholdingPct, contractContent } = generateContractTemplate(
      employeeName,
      jobTitle,
      baseSalary || 50000,
      currency || 'INR',
      country || 'IN'
    );

    const contract = await prisma.legalContract.create({
      data: {
        contractNumber,
        signeeName: employeeName,
        signeeEmail: signeeEmail || `${employeeName.toLowerCase().replace(/\s+/g, '.')}@talent.elvooriq.com`,
        jobTitle,
        country: (country || 'IN').toUpperCase(),
        taxForm,
        taxWithholdingPct,
        baseSalary: Number(baseSalary) || 50000,
        currency: currency || 'INR',
        contractContent,
        status: 'DRAFT',
        signeeId: signeeId || null,
        preparerId: req.user?.id || null
      }
    });

    return res.status(201).json({
      success: true,
      contract
    });
  } catch (error) {
    console.error('[Legal] Error generating contract:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/legal/contracts
 * Lists contracts across the agency
 */
router.get('/contracts', authorize(['ADMIN', 'EMPLOYEE']), async (req, res) => {
  try {
    const contracts = await prisma.legalContract.findMany({
      include: {
        signature: {
          select: {
            sha256Checksum: true,
            signedAt: true,
            ipAddress: true
          }
        },
        signee: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      contracts
    });
  } catch (error) {
    console.error('[Legal] Error fetching contracts:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/legal/contract/:id
 * Retrieves contract text and signing status for preview canvas
 */
router.get('/contract/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await prisma.legalContract.findUnique({
      where: { id },
      include: {
        signature: true
      }
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    return res.status(200).json({
      success: true,
      contract
    });
  } catch (error) {
    console.error('[Legal] Error fetching contract detail:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/legal/sign
 * Cryptographically executes a digital contract signature
 */
router.post('/sign', async (req, res) => {
  try {
    const {
      contractId,
      signerName,
      signerId,
      signatureImage,
      taxIdNumber
    } = req.body;

    if (!contractId || !signerName || !signatureImage) {
      return res.status(400).json({
        success: false,
        message: 'Contract ID, signer name, and signature canvas drawing are required'
      });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'ELVOORIQ-Client';

    const result = await executeLegalContractSignature({
      contractId,
      signerName,
      signerId: signerId || req.user?.id || null,
      signatureImage,
      taxIdNumber: taxIdNumber || 'PAN-DEF-99881',
      ipAddress: String(ipAddress),
      userAgent: String(userAgent)
    });

    // Notify via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.emit('contract:signed', {
        contractId: result.contract.id,
        contractNumber: result.contract.contractNumber,
        signerName: result.signature.signerName,
        sha256Checksum: result.signature.sha256Checksum
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contract cryptographically signed and user verified',
      data: result
    });
  } catch (error) {
    console.error('[Legal] Error executing signature:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
