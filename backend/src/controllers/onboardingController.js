const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Parses salary and metadata patterns from raw Offer Letter text content
 * @param {string} text - Clean string representing extracted PDF text
 * @returns {object} - Identified parameters
 */
const parseOfferLetterText = (text) => {
  // Normalize whitespace to prevent breaks in pattern matching
  const normalText = text.replace(/\s+/g, ' ');

  // 1. Extract Salary Figures (matches patterns like "INR 75,000", "Rs. 80000", "$120,000", "₹ 95,000 per month")
  const salaryRegex = /(?:salary|compensation|base pay|remuneration|wage|ctc|package|offering)\s*(?:of|is|:)?\s*(?:Rs\.?|INR|\$|USD|€|EUR|₹)?\s*([0-9,]{4,10})/i;
  const salaryMatch = normalText.match(salaryRegex);
  let parsedSalary = 0.0;
  if (salaryMatch && salaryMatch[1]) {
    // Strip commas and parse float
    parsedSalary = parseFloat(salaryMatch[1].replace(/,/g, ''));
  }

  // 2. Identify Currency Type
  let currency = 'INR'; // Default
  if (/\b(?:USD|\$|Dollars)\b/i.test(normalText)) {
    currency = 'USD';
  } else if (/\b(?:EUR|€|Euros)\b/i.test(normalText)) {
    currency = 'EUR';
  } else if (/\b(?:GBP|£|Pounds)\b/i.test(normalText)) {
    currency = 'GBP';
  } else if (/\b(?:INR|₹|Rs|Rupees)\b/i.test(normalText)) {
    currency = 'INR';
  }

  // 3. Extract Proposed Job Title (matches "position of [Title]" or "role of [Title]" or "as a [Title]")
  const titleRegex = /(?:position of|role of|as a|designation as|appointed as)\s+([A-Za-z\s]{3,35})(?:,|\.|\s+with|\s+at)/i;
  const titleMatch = normalText.match(titleRegex);
  let jobTitle = 'Talent Agent'; // Default fallback
  if (titleMatch && titleMatch[1]) {
    jobTitle = titleMatch[1].trim();
  }

  // 4. Try to parse Start Date
  const dateRegex = /(?:starting on|commencing on|start date|effective from)\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4})/i;
  const dateMatch = normalText.match(dateRegex);
  let startDate = new Date();
  if (dateMatch && dateMatch[1]) {
    const cleanDateStr = dateMatch[1].replace(/(st|nd|rd|th)/g, '');
    const parsedDate = Date.parse(cleanDateStr);
    if (!isNaN(parsedDate)) {
      startDate = new Date(parsedDate);
    }
  }

  return {
    baseSalary: parsedSalary,
    currency,
    jobTitle,
    startDate,
    parsedSuccessfully: parsedSalary > 0
  };
};

/**
 * Express Controller to handle the Offer Letter PDF upload and trigger text parsing
 */
const uploadAndParseOfferLetter = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please upload an Offer Letter in PDF format.' });
    }

    const { employeeUserId } = req.body;
    if (!employeeUserId) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Target Employee User ID must be provided.' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: employeeUserId },
      include: { employmentRecord: true }
    });

    if (!targetUser) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Specified employee record not found.' });
    }

    // Load PDF file buffer
    const dataBuffer = fs.readFileSync(req.file.path);
    
    // Parse PDF into raw string
    let extractedText = '';
    try {
      const pdfParseModule = require('pdf-parse');
      if (typeof pdfParseModule === 'function') {
        const pdfData = await pdfParseModule(dataBuffer);
        extractedText = pdfData.text || '';
      } else if (pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse({ data: dataBuffer });
        try {
          const result = await parser.getText();
          extractedText = result.text || '';
        } finally {
          if (typeof parser.destroy === 'function') await parser.destroy();
        }
      }
    } catch (parseErr) {
      console.warn('PDF parsing warning:', parseErr.message);
    }

    // Run custom regex NLP engine
    const parsedData = parseOfferLetterText(extractedText);

    // Save PDF file permanently under workspace uploads and get path link
    const uploadDir = path.join(__dirname, '../../uploads/contracts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const permanentPath = path.join(uploadDir, `${targetUser.id}-offer-letter.pdf`);
    fs.copyFileSync(req.file.path, permanentPath);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    const contractUrl = `/uploads/contracts/${targetUser.id}-offer-letter.pdf`;

    return res.status(200).json({
      success: true,
      message: parsedData.parsedSuccessfully 
        ? 'Offer Letter uploaded and parsed successfully.' 
        : 'Offer Letter parsed, but some figures could not be extracted automatically.',
      preview: {
        employeeId: targetUser.id,
        employeeName: targetUser.fullName,
        employeeEmail: targetUser.email,
        jobTitle: parsedData.jobTitle,
        baseSalary: parsedData.baseSalary || 75000,
        currency: parsedData.currency,
        startDate: parsedData.startDate.toISOString().split('T')[0],
        contractUrl,
        onboardingMethod: 'PARSED_OFFER',
        extractedTextSnippet: extractedText.substring(0, 400) + '...'
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error in uploadAndParseOfferLetter:', error);
    return res.status(500).json({ success: false, message: 'Failed to process Offer Letter upload.', error: error.message });
  }
};

/**
 * Commits the approved preview values to the SQL database
 */
const saveApprovedEmploymentRecord = async (req, res) => {
  try {
    const { employeeId, jobTitle, baseSalary, currency, startDate, contractUrl, onboardingMethod, rawSnippet } = req.body;

    if (!employeeId || !jobTitle || baseSalary === undefined) {
      return res.status(400).json({ success: false, message: 'Missing approved parameters.' });
    }

    const updatedRecord = await prisma.employmentRecord.upsert({
      where: { userId: employeeId },
      update: {
        jobTitle,
        baseSalary: parseFloat(baseSalary),
        currency: currency || 'INR',
        startDate: startDate ? new Date(startDate) : new Date(),
        contractUrl: contractUrl || null,
        onboardingMethod: onboardingMethod || 'PARSED_OFFER',
        offerLetterText: rawSnippet || null,
        parsedAt: new Date()
      },
      create: {
        userId: employeeId,
        jobTitle,
        baseSalary: parseFloat(baseSalary),
        currency: currency || 'INR',
        startDate: startDate ? new Date(startDate) : new Date(),
        contractUrl: contractUrl || null,
        onboardingMethod: onboardingMethod || 'PARSED_OFFER',
        offerLetterText: rawSnippet || null,
        parsedAt: new Date()
      }
    });

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'ONBOARDING_OFFER_COMMITTED',
        message: `Offer Letter approved & saved: ${jobTitle} (${currency} ${baseSalary})`,
        timestamp: new Date().toISOString(),
        meta: { employeeId, jobTitle, baseSalary }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Employment profile committed successfully.',
      record: updatedRecord
    });
  } catch (error) {
    console.error('Error in saveApprovedEmploymentRecord:', error);
    return res.status(500).json({ success: false, message: 'Failed to commit Employment Record.', error: error.message });
  }
};

module.exports = {
  uploadAndParseOfferLetter,
  saveApprovedEmploymentRecord,
  parseOfferLetterText
};
