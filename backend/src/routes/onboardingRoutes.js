const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const authorize = require('../middlewares/rbac');
const {
  uploadAndParseOfferLetter,
  saveApprovedEmploymentRecord
} = require('../controllers/onboardingController');

// Ensure temporary upload directory exists
const tempUploadDir = process.env.VERCEL ? '/tmp/uploads/temp' : path.join(__dirname, '../../uploads/temp');
try {
  if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
  }
} catch (_) {}

// Multer configuration for PDF upload (max 15MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are supported for automated offer ingestion.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter
});

// Admin-only endpoints for Offer Letter Parsing and Ingestion
router.post('/offer-letter', authorize(['ADMIN']), upload.single('offerLetter'), uploadAndParseOfferLetter);
router.post('/commit-offer', authorize(['ADMIN']), saveApprovedEmploymentRecord);

module.exports = router;
