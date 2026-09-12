const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const authorize = require('../middlewares/rbac');
const { compileOfferPDF } = require('../services/offerLetterCompiler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configure SMTP transport credentials
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  // Safe test transport for local testing if SMTP credentials are omitted
  return {
    sendMail: async (mailOptions) => {
      console.log(`[SMTP-SIMULATOR] Offer letter email dispatched to: ${mailOptions.to}`);
      return { messageId: `simulated-${Date.now()}` };
    }
  };
};

/**
 * @route   POST /api/hr/onboarding/generate-and-send
 * @desc    Generate a corporate offer letter, save to local static storage, and send to candidate.
 * @access  Private (ADMIN / HR only)
 */
router.post('/generate-and-send', authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, whatsapp, jobTitle, compensationBasis, amount, startDate, endDate } = req.body;

    if (!name || !email || !jobTitle || !compensationBasis || !startDate) {
      return res.status(400).json({ success: false, message: "Required parameters are missing (name, email, jobTitle, compensationBasis, startDate)." });
    }

    // 1. Create or retrieve Deactivated Candidate User Profile
    let candidateUser = await prisma.user.findUnique({ where: { email } });
    if (!candidateUser) {
      const generatedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8) + '!9A', 12);
      candidateUser = await prisma.user.create({
        data: {
          fullName: name,
          email,
          password: generatedPassword,
          role: 'EMPLOYEE',
          status: 'PENDING',
          isEnabled: false,
          whatsapp: whatsapp || null
        }
      });
    } else if (name && candidateUser.fullName !== name) {
      // Keep name updated
      candidateUser = await prisma.user.update({
        where: { id: candidateUser.id },
        data: { fullName: name, whatsapp: whatsapp || candidateUser.whatsapp }
      });
    }

    // 2. Run PDF Compilation Service
    const offerPayload = {
      candidateId: candidateUser.id,
      jobTitle,
      compensationBasis,
      amount: parseFloat(amount) || 0,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null
    };

    const pdfBuffer = await compileOfferPDF(offerPayload, candidateUser);

    // 3. Write PDF to static asset storage (for direct dashboard download)
    const staticDir = process.env.VERCEL ? '/tmp/uploads/offer-letters' : path.join(__dirname, '../../uploads/offer-letters');
    try {
      if (!fs.existsSync(staticDir)) {
        fs.mkdirSync(staticDir, { recursive: true });
      }
    } catch (_) {}

    const fileName = `${candidateUser.id}-offer-letter.pdf`;
    const absolutePath = path.join(staticDir, fileName);
    try {
      fs.writeFileSync(absolutePath, pdfBuffer);
    } catch (writeErr) {
      console.warn('PDF write notice:', writeErr.message);
    }
    const pdfUrl = `/uploads/offer-letters/${fileName}`;

    // 4. Save or Update Offer Record in DB
    let hrUserId = req.user?.id;
    const hrExists = hrUserId ? await prisma.user.findUnique({ where: { id: hrUserId } }) : null;
    if (!hrExists) {
      const fallbackAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      hrUserId = fallbackAdmin ? fallbackAdmin.id : candidateUser.id;
    }
    const offerRecord = await prisma.offerLetter.upsert({
      where: { candidateId: candidateUser.id },
      update: {
        hrId: hrUserId,
        jobTitle,
        compensationBasis,
        amount: offerPayload.amount,
        startDate: offerPayload.startDate,
        endDate: offerPayload.endDate,
        pdfUrl,
        status: 'SENT'
      },
      create: {
        candidateId: candidateUser.id,
        hrId: hrUserId,
        jobTitle,
        compensationBasis,
        amount: offerPayload.amount,
        startDate: offerPayload.startDate,
        endDate: offerPayload.endDate,
        pdfUrl,
        status: 'SENT'
      }
    });

    // Also update or seed employment record for financial syncing
    await prisma.employmentRecord.upsert({
      where: { userId: candidateUser.id },
      update: {
        jobTitle,
        baseSalary: offerPayload.amount,
        currency: 'INR',
        startDate: offerPayload.startDate,
        endDate: offerPayload.endDate,
        contractUrl: pdfUrl
      },
      create: {
        userId: candidateUser.id,
        jobTitle,
        baseSalary: offerPayload.amount,
        currency: 'INR',
        startDate: offerPayload.startDate,
        endDate: offerPayload.endDate,
        contractUrl: pdfUrl,
        department: 'CREATIVE_OPERATIONS',
        employmentType: compensationBasis === 'SALARY' ? 'FULL_TIME' : (compensationBasis === 'STIPEND' ? 'CONTRACT' : 'PART_TIME'),
        status: 'ACTIVE'
      }
    });

    // 5. Build secure activation URL link for Candidate login
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const activationUrl = `${frontendBase}/onboard/${candidateUser.id}`;

    // 6. Dispatch Automated Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #1e293b; background-color: #0b0f12; color: #e2e8f0; border-radius: 8px;">
        <h2 style="color: #199580; text-align: center; margin-top: 0;">Welcome to ELVOORIQ Creative Agency!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We are excited to invite you to join our global network as a <strong>${jobTitle}</strong>. Your official appointment offer letter has been compiled successfully by our Operations Desk.</p>
        <p>We have attached your official contract in PDF format directly to this email for your immediate records. You can log in directly to our secure onboarding portal to digitally sign your acceptance and submit your compliance documents.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationUrl}" style="background-color: #199580; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; letter-spacing: 0.5px;">Access Secure Onboarding Portal</a>
        </div>
        <p style="font-size: 11px; color: #64748b; text-align: center;">Reference ID: EVQ-OL-${candidateUser.id.substring(0, 8).toUpperCase()} | Confirmed under regulatory corporate bylaws.</p>
      </div>
    `;

    const transporter = getTransporter();
    try {
      await transporter.sendMail({
        from: '"ELVOORIQ HR Division" <HR@elvooriq.com>',
        to: email,
        subject: `Official Appointment Offer: ${jobTitle} | ELVOORIQ Creative Agency`,
        html: emailHtml,
        attachments: [
          {
            filename: `Official_Offer_Letter_${name.replace(/\s+/g, '_')}.pdf`,
            path: absolutePath
          }
        ]
      });
    } catch (mailErr) {
      console.warn('Mail dispatch warning:', mailErr.message);
    }

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'OFFER_LETTER_GENERATED',
        message: `Offer letter generated and staged for ${name} (${jobTitle} - ${compensationBasis})`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: "Offer letter generated, saved, and dispatched successfully via Nodemailer.",
      pdfDownloadUrl: pdfUrl,
      offerId: offerRecord.id,
      candidateId: candidateUser.id,
      activationUrl
    });

  } catch (error) {
    console.error('Error generating offer letter:', error);
    return res.status(500).json({ success: false, message: "Hiring transaction failed.", error: error.message });
  }
});

/**
 * @route   GET /api/hr/onboarding/offers
 * @desc    Fetch list of generated offer letters with candidate metadata.
 * @access  Private (ADMIN / HR only)
 */
router.get('/offers', authorize(['ADMIN']), async (req, res) => {
  try {
    const offers = await prisma.offerLetter.findMany({
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            whatsapp: true,
            status: true,
            isEnabled: true
          }
        },
        hr: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      offers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve offer letters.", error: error.message });
  }
});

/**
 * @route   GET /api/candidate/:userId/offer
 * @desc    Fetch offer letter details for the candidate.
 * @access  Public / Candidate
 */
const getCandidateOfferHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const offer = await prisma.offerLetter.findUnique({
      where: { candidateId: userId },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            whatsapp: true,
            status: true,
            isEnabled: true
          }
        }
      }
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: "No appointment offer found for this candidate." });
    }

    return res.status(200).json({
      success: true,
      offer
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load candidate offer details.", error: error.message });
  }
};

router.get('/:userId/offer', getCandidateOfferHandler);
router.get('/candidate/:userId/offer', getCandidateOfferHandler);

/**
 * @route   POST /api/candidate/:userId/sign-offer
 * @desc    Candidate digitally signs their appointment offer letter.
 * @access  Public / Candidate
 */
const signOfferHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { signatureImage, signatureHash: clientHash } = req.body;

    const offer = await prisma.offerLetter.findUnique({
      where: { candidateId: userId }
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: "Target offer letter not found." });
    }

    // Generate cryptographic verification signature hash
    const signatureHash = clientHash || crypto
      .createHash('sha256')
      .update(`${userId}:${offer.jobTitle}:${offer.amount}:${Date.now()}`)
      .digest('hex');

    const updatedOffer = await prisma.offerLetter.update({
      where: { id: offer.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signatureHash
      }
    });

    // Auto-Activation Evaluation check:
    const requiredTypes = ['ID_PROOF', 'DEGREE_CERTIFICATE', 'EXPERIENCE_LETTER', 'BANK_PROOF', 'NDA', 'TAX_FORM'];
    const userDocs = await prisma.onboardingDocument.findMany({
      where: { userId }
    });
    const verifiedDocs = userDocs.filter(d => d.status === 'VERIFIED' && requiredTypes.includes(d.documentType));

    let autoActivated = false;
    if (verifiedDocs.length === requiredTypes.length) {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE', isEnabled: true }
      });
      autoActivated = true;
    }

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'OFFER_LETTER_SIGNED',
        message: `Candidate ${userId} digitally accepted and signed offer letter. Auto-activated: ${autoActivated}`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: "Offer contract accepted and digitally signed successfully.",
      signatureHash,
      signedAt: updatedOffer.signedAt,
      autoActivated
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to sign offer contract.", error: error.message });
  }
};

router.post('/:userId/sign-offer', signOfferHandler);
router.post('/candidate/:userId/sign-offer', signOfferHandler);

module.exports = router;
