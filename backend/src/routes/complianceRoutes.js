const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const authorize = require('../middlewares/rbac');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const REQUIRED_TYPES = ['ID_PROOF', 'DEGREE_CERTIFICATE', 'EXPERIENCE_LETTER', 'BANK_PROOF', 'NDA', 'TAX_FORM'];

// Setup compliance file storage
const complianceUploadDir = path.join(__dirname, '../../uploads/compliance-documents');
if (!fs.existsSync(complianceUploadDir)) {
  fs.mkdirSync(complianceUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, complianceUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const docType = req.body.documentType || 'DOC';
    const userId = req.params.userId || 'candidate';
    const safeName = `${userId}-${docType}-${Date.now()}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const isExtAllowed = /\.(pdf|jpg|jpeg|png|webp)$/i.test(file.originalname);
    if (allowed.includes(file.mimetype) || isExtAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, or PNG files are supported for compliance verification.'), false);
    }
  }
});

/**
 * @route   PUT /api/hr/onboarding/:userId/verify-document
 * @desc    Approve or Reject a specific corporate compliance document.
 * @access  Private (ADMIN / HR only)
 */
router.put('/onboarding/:userId/verify-document', authorize(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { documentType, status, rejectionReason } = req.body; // status: "VERIFIED" or "REJECTED"

    if (!documentType || !['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid document verification parameters. Status must be VERIFIED or REJECTED." });
    }

    // Check if the onboarding document record exists
    const document = await prisma.onboardingDocument.findUnique({
      where: { userId_documentType: { userId, documentType } }
    });

    if (!document) {
      return res.status(404).json({ success: false, message: "Specified compliance document record not found in system." });
    }

    // Update Document state
    const updatedDoc = await prisma.onboardingDocument.update({
      where: { id: document.id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? (rejectionReason || 'Document flagged by compliance audit.') : null,
        verifiedAt: status === 'VERIFIED' ? new Date() : null
      }
    });

    // Run Auto-Activation Check:
    const userDocs = await prisma.onboardingDocument.findMany({
      where: { userId }
    });

    const verifiedDocs = userDocs.filter(d => d.status === 'VERIFIED' && REQUIRED_TYPES.includes(d.documentType));
    const offerLetter = await prisma.offerLetter.findUnique({ where: { candidateId: userId } });
    const isOfferLetterSigned = offerLetter && offerLetter.status === 'SIGNED';

    let autoActivated = false;
    if (verifiedDocs.length === REQUIRED_TYPES.length && isOfferLetterSigned) {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE', isEnabled: true }
      });
      autoActivated = true;
    }

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'COMPLIANCE_DOC_VERIFIED',
        message: `Compliance document ${documentType} for ${userId} marked ${status}. Verified ${verifiedDocs.length}/6. Auto-activated: ${autoActivated}`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Document verification saved. Status updated to ${status}.`,
      document: updatedDoc,
      verifiedCount: verifiedDocs.length,
      totalRequired: REQUIRED_TYPES.length,
      isOfferLetterSigned: !!isOfferLetterSigned,
      autoActivated
    });

  } catch (error) {
    console.error('Compliance evaluation error:', error);
    return res.status(500).json({ success: false, message: "Compliance evaluation failed.", error: error.message });
  }
});

/**
 * @route   GET /api/hr/onboarding/candidates
 * @desc    Fetch all onboarding candidates with verification status and documents.
 * @access  Private (ADMIN / HR only)
 */
router.get('/onboarding/candidates', authorize(['ADMIN']), async (req, res) => {
  try {
    const candidates = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'EMPLOYEE' },
          { receivedOffer: { isNot: null } },
          { complianceDocs: { some: {} } }
        ]
      },
      include: {
        receivedOffer: true,
        complianceDocs: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = candidates.map(c => {
      const verifiedCount = (c.complianceDocs || []).filter(d => d.status === 'VERIFIED' && REQUIRED_TYPES.includes(d.documentType)).length;
      return {
        id: c.id,
        name: c.fullName,
        fullName: c.fullName,
        email: c.email,
        whatsapp: c.whatsapp,
        role: c.role,
        status: c.status,
        isEnabled: c.isEnabled,
        createdAt: c.createdAt,
        offerLetter: c.receivedOffer,
        complianceDocs: c.complianceDocs || [],
        verifiedCount,
        totalRequired: REQUIRED_TYPES.length,
        isFullyCompliant: verifiedCount === REQUIRED_TYPES.length && c.receivedOffer?.status === 'SIGNED'
      };
    });

    return res.status(200).json({
      success: true,
      candidates: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load onboarding candidates.", error: error.message });
  }
});

/**
 * @route   GET /api/candidate/:userId/documents
 * @desc    Fetch all compliance documents and status for the candidate.
 * @access  Public / Candidate
 */
const getCandidateDocumentsHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        isEnabled: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Candidate user not found." });
    }

    const documents = await prisma.onboardingDocument.findMany({
      where: { userId }
    });

    const offerLetter = await prisma.offerLetter.findUnique({
      where: { candidateId: userId }
    });

    const verifiedCount = documents.filter(d => d.status === 'VERIFIED' && REQUIRED_TYPES.includes(d.documentType)).length;

    return res.status(200).json({
      success: true,
      user,
      documents,
      offerLetter,
      verifiedCount,
      totalRequired: REQUIRED_TYPES.length,
      isOfferLetterSigned: offerLetter?.status === 'SIGNED'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load candidate documents.", error: error.message });
  }
};

router.get('/:userId/documents', getCandidateDocumentsHandler);
router.get('/candidate/:userId/documents', getCandidateDocumentsHandler);

/**
 * @route   POST /api/candidate/:userId/upload-document
 * @desc    Candidate uploads compliance document (PDF or image).
 * @access  Public / Candidate
 */
const uploadDocumentHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No document file was provided." });
    }

    if (!documentType || !REQUIRED_TYPES.includes(documentType)) {
      return res.status(400).json({ success: false, message: `Invalid document category. Must be one of: ${REQUIRED_TYPES.join(', ')}` });
    }

    // Verify candidate exists
    const candidate = await prisma.user.findUnique({ where: { id: userId } });
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found." });
    }

    const fileUrl = `/uploads/compliance-documents/${req.file.filename}`;

    const savedDoc = await prisma.onboardingDocument.upsert({
      where: { userId_documentType: { userId, documentType } },
      update: {
        documentName: req.file.originalname,
        fileUrl,
        status: 'PENDING',
        rejectionReason: null,
        verifiedAt: null
      },
      create: {
        userId,
        documentType,
        documentName: req.file.originalname,
        fileUrl,
        status: 'PENDING'
      }
    });

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'COMPLIANCE_DOC_UPLOADED',
        message: `Candidate ${candidate.fullName} uploaded ${documentType} (${req.file.originalname}).`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: `${documentType} uploaded successfully and queued for HR review.`,
      document: savedDoc
    });

  } catch (error) {
    console.error('Error uploading compliance document:', error);
    return res.status(500).json({ success: false, message: "Document upload failed.", error: error.message });
  }
};

router.post('/:userId/upload-document', upload.single('document'), uploadDocumentHandler);
router.post('/candidate/:userId/upload-document', upload.single('document'), uploadDocumentHandler);

module.exports = router;
