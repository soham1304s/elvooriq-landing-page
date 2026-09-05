// backend/src/services/extractionEngine.js

const CURRENCY_MAP = {
  '₹': 'INR',
  'rs': 'INR',
  'rs.': 'INR',
  'rupees': 'INR',
  'inr': 'INR',
  '$': 'USD',
  'usd': 'USD',
  'dollar': 'USD',
  'dollars': 'USD',
  '€': 'EUR',
  'eur': 'EUR',
  'euro': 'EUR',
  'euros': 'EUR',
  '£': 'GBP',
  'gbp': 'GBP',
  'pounds': 'GBP'
};

/**
 * Normalizes numbers and formatting artifacts (including Indian Lakh notation)
 * @param {string} numStr 
 * @returns {number} Standardized numerical float
 */
const cleanNumericString = (numStr) => {
  // Strip commas, spaces, and currency symbols
  let sanitized = numStr.replace(/[\s,]/g, '').toLowerCase();
  
  // Convert Indian Lakh / Lakhs notation to float math
  if (/lakh/i.test(sanitized)) {
    const val = parseFloat(sanitized.replace(/lakhs?/i, ''));
    return val * 100000;
  }
  
  return parseFloat(sanitized) || 0;
};

/**
 * Parses salary and metadata from PDF plain text using a priority heuristic matrix.
 * @param {string} text - Raw string extracted from PDF
 * @returns {object} Standardized extraction payload
 */
const extractCompensationDetails = (text) => {
  if (!text) {
    return {
      success: false,
      baseSalary: 0,
      rawExtractedValue: '',
      extractedCurrency: 'INR',
      intervalUsed: 'monthly',
      jobTitle: 'Talent Agent',
      startDate: new Date(),
      matchedSnippet: '',
      confidenceScore: 0
    };
  }

  const cleanText = text.replace(/\s+/g, ' ');
  const lowerText = cleanText.toLowerCase();

  let matchedAmount = 0.0;
  let rawExtractedValue = "";
  let currency = "INR";
  let interval = "monthly";
  let matchedSnippet = "";
  let confidence = 0.0;

  // Multi-tier priority lookaround regex matrix
  const heuristics = [
    {
      name: "Annual CTC Package",
      regex: /(?:annual fixed ctc|fixed ctc|total ctc|ctc|package|annual compensation|annual package|annual gross|annual salary)\b(?:\s+(?:will be|shall be|is|of|valued at|amounting to|stands at|equal to|at|[:=-]))*\s*([₹$€£]|rs\.?|inr|usd|eur|gbp)?\s*([\d,]+(?:\.\d+)?(?:\s*lakhs?)?)/gi,
      interval: "annual",
      confidence: 98
    },
    {
      name: "Monthly Base / Gross / Stipend",
      regex: /(?:monthly gross salary|gross salary|monthly salary|monthly base|base salary|basic pay|monthly stipend|stipend|allowance)\b(?:\s+(?:will be|shall be|is|of|valued at|amounting to|stands at|equal to|at|[:=-]))*\s*([₹$€£]|rs\.?|inr|usd|eur|gbp)?\s*([\d,]+(?:\.\d+)?(?:\s*lakhs?)?)/gi,
      interval: "monthly",
      confidence: 92
    },
    {
      name: "Per Month Specification",
      regex: /(?:[₹$€£]|rs\.?|inr|usd|eur|gbp)?\s*([\d,]+(?:\.\d+)?(?:\s*lakhs?)?)\s*(?:\/-)?\s*(?:per\s*month|p\.m\.?|pm|\/month|\/mo|monthly)/gi,
      interval: "monthly",
      confidence: 88
    },
    {
      name: "Per Annum Specification",
      regex: /(?:[₹$€£]|rs\.?|inr|usd|eur|gbp)?\s*([\d,]+(?:\.\d+)?(?:\s*lakhs?)?)\s*(?:\/-)?\s*(?:per\s*annum|p\.a\.?|pa|\/year|\/yr|annually)/gi,
      interval: "annual",
      confidence: 90
    },
    {
      name: "General Currency Amount Fallback",
      regex: /(?:₹|rs\.?|inr|\$|usd|€|£)\s*([\d,]+(?:\.\d+)?(?:\s*lakhs?)?)/gi,
      interval: "monthly",
      confidence: 70
    }
  ];

  // Evaluate heuristics sequentially (highest priority to lowest)
  for (const rule of heuristics) {
    rule.regex.lastIndex = 0; // Safe reset
    const match = rule.regex.exec(lowerText);
    
    if (match) {
      // Find the group with the number
      const numStr = match[2] && /[\d]/.test(match[2]) ? match[2] : (match[1] && /[\d]/.test(match[1]) ? match[1] : null);
      
      if (numStr) {
        matchedAmount = cleanNumericString(numStr);
        rawExtractedValue = match[0].trim();
        interval = rule.interval;
        confidence = rule.confidence;

        // Isolate context snippet (character-bounded window)
        const matchIdx = match.index;
        const start = Math.max(0, matchIdx - 40);
        const end = Math.min(cleanText.length, matchIdx + match[0].length + 60);
        matchedSnippet = `...${cleanText.substring(start, end).trim()}...`;

        // Check matched currency group or scan snippet
        const currencyHint = (match[1] && !/[\d]/.test(match[1]) ? match[1] : '').toLowerCase();
        if (currencyHint && CURRENCY_MAP[currencyHint]) {
          currency = CURRENCY_MAP[currencyHint];
        } else {
          const snippetLower = matchedSnippet.toLowerCase();
          for (const [symbol, isoCode] of Object.entries(CURRENCY_MAP)) {
            if (snippetLower.includes(symbol)) {
              currency = isoCode;
              break;
            }
          }
        }
        break; // Match found at highest priority, break execution loop
      }
    }
  }

  // Calculate standardized monthly base salary
  let monthlySalary = matchedAmount;
  if (interval === "annual") {
    monthlySalary = parseFloat((matchedAmount / 12).toFixed(2));
  }

  // Parse Job Title using heuristics
  const titleRegex = /(?:position of|role of|as a|designation as|appointed as)\s+([A-Za-z\s]{3,30})(?:,|\.|\s+with|\s+at)/i;
  const titleMatch = cleanText.match(titleRegex);
  let jobTitle = "Talent Agent";
  if (titleMatch && titleMatch[1]) {
    jobTitle = titleMatch[1].trim();
  }

  // Parse Start Date
  const dateRegex = /(?:starting on|commencing on|start date|effective from)\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4})/i;
  const dateMatch = cleanText.match(dateRegex);
  let startDate = new Date();
  if (dateMatch && dateMatch[1]) {
    const cleanDateStr = dateMatch[1].replace(/(st|nd|rd|th)/g, '');
    const parsedDate = Date.parse(cleanDateStr);
    if (!isNaN(parsedDate)) {
      startDate = new Date(parsedDate);
    }
  }

  return {
    success: monthlySalary > 0,
    baseSalary: monthlySalary,
    rawExtractedValue,
    extractedCurrency: currency,
    intervalUsed: interval,
    jobTitle,
    startDate,
    matchedSnippet,
    confidenceScore: confidence
  };
};

module.exports = {
  extractCompensationDetails,
  cleanNumericString
};
