// backend/src/routes/hrRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParseModule = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authorize = require('../middlewares/rbac');
const { extractCompensationDetails } = require('../services/extractionEngine');

async function parsePdfBuffer(buffer) {
  if (typeof pdfParseModule === 'function') {
    return await pdfParseModule(buffer);
  }
  if (pdfParseModule.PDFParse) {
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return { text: result.text || '' };
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    }
  }
  throw new Error('Unsupported pdf-parse version installed.');
}

// Setup secure memory buffer for PDF ingestion (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only vector PDF files are supported for automated ingestion.'), false);
    }
  }
});

/**
 * @route   GET /api/hr/employees
 * @desc    Fetch a lightweight roster of active employees to populate dropdown selectors.
 * @access  Private (ADMIN / HR Only)
 */
router.get('/employees', authorize(['ADMIN']), async (req, res) => {
  try {
    const activeEmployees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        isEnabled: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        whatsapp: true,
        employmentRecord: {
          select: {
            jobTitle: true,
            department: true,
            baseSalary: true,
            currency: true
          }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    return res.status(200).json({
      success: true,
      message: 'Active employee roster retrieved successfully.',
      employees: activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.fullName,
        fullName: emp.fullName,
        email: emp.email,
        whatsapp: emp.whatsapp,
        jobTitle: emp.employmentRecord ? emp.employmentRecord.jobTitle : 'Talent Agent',
        department: emp.employmentRecord ? emp.employmentRecord.department : 'Talent Operations',
        baseSalary: emp.employmentRecord ? emp.employmentRecord.baseSalary : 75000,
        currency: emp.employmentRecord ? emp.employmentRecord.currency : 'INR'
      }))
    });
  } catch (error) {
    console.error('Error in /api/hr/employees:', error);
    return res.status(500).json({ success: false, message: 'Failed to load active employee directory.', error: error.message });
  }
});

/**
 * @route   POST /api/hr/upload-offer-letter
 * @desc    Receive PDF contract, parse text in memory, and run compensation extraction engine.
 * @access  Private (ADMIN / HR Only)
 */
router.post('/upload-offer-letter', authorize(['ADMIN']), upload.single('offerLetter'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No offer letter PDF file provided.' });
    }

    // Convert raw binary buffer to plaintext using pdf-parse
    const pdfContent = await parsePdfBuffer(req.file.buffer);
    const parsedText = pdfContent.text;

    if (!parsedText || parsedText.trim().length < 20) {
      return res.status(422).json({
        success: false,
        message: 'The uploaded document contains un-extractable text. Ensure the PDF is not an image scan.'
      });
    }

    // Run v4.0 Layout-Invariant Document Parsing Engine (Section 4.1)
    const OfferLetterParser = require('../services/offerLetterParser');
    const extractionResult = OfferLetterParser.parse(parsedText);

    return res.status(200).json({
      success: true,
      message: 'Offer letter parsed successfully.',
      data: {
        ...extractionResult,
        extractedCurrency: extractionResult.currency,
        fileName: req.file.originalname,
        byteSize: req.file.size
      }
    });

  } catch (err) {
    console.error('Error parsing offer letter:', err);
    return res.status(500).json({
      success: false,
      message: 'Document parsing failed.',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/hr/employee/:userId/employment-record
 * @desc    Commit parsed or manual salary/employment verification to database.
 * @access  Private (ADMIN Only)
 */
router.post('/employee/:userId/employment-record', authorize(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      jobTitle, 
      baseSalary, 
      currency, 
      startDate, 
      onboardingMethod, 
      rawSnippet,
      rawExtractedValue,
      extractedCurrency 
    } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    const updated = await prisma.employmentRecord.upsert({
      where: { userId },
      update: {
        jobTitle: jobTitle || 'Talent Agent',
        baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : 0,
        currency: currency || 'INR',
        startDate: startDate ? new Date(startDate) : new Date(),
        onboardingMethod: onboardingMethod || 'PARSED_OFFER',
        rawExtractedValue: rawExtractedValue || (baseSalary ? `${currency || 'INR'} ${baseSalary}` : null),
        extractedCurrency: extractedCurrency || currency || 'INR',
        matchedSnippet: rawSnippet || null,
        offerLetterText: rawSnippet || null,
        parsedAt: new Date()
      },
      create: {
        userId,
        jobTitle: jobTitle || 'Talent Agent',
        department: 'TALENT_MANAGEMENT',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : 0,
        currency: currency || 'INR',
        startDate: startDate ? new Date(startDate) : new Date(),
        onboardingMethod: onboardingMethod || 'PARSED_OFFER',
        rawExtractedValue: rawExtractedValue || (baseSalary ? `${currency || 'INR'} ${baseSalary}` : null),
        extractedCurrency: extractedCurrency || currency || 'INR',
        matchedSnippet: rawSnippet || null,
        offerLetterText: rawSnippet || null,
        parsedAt: new Date()
      }
    });

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'EMPLOYMENT_RECORD_COMMITTED',
        message: `Employment record committed for ${user.fullName} (${updated.jobTitle} - ${updated.currency} ${updated.baseSalary})`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Employment record validated and committed successfully.',
      record: updated
    });
  } catch (error) {
    console.error('Error committing employment record:', error);
    return res.status(500).json({ success: false, message: 'Failed to commit employment record.', error: error.message });
  }
});

module.exports = router;
