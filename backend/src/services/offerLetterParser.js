/**
 * ELVOORIQ Layout-Invariant Document Parsing Engine (v4.0)
 * Standardizes currencies, compensation metrics, and job titles.
 */

const CURRENCY_DICTIONARY = {
  '₹': 'INR', 'rs': 'INR', 'rs.': 'INR', 'rupees': 'INR', 'inr': 'INR',
  '$': 'USD', 'usd': 'USD', 'dollars': 'USD', 'dollar': 'USD',
  '€': 'EUR', 'eur': 'EUR', 'euro': 'EUR', 'euros': 'EUR',
  '£': 'GBP', 'gbp': 'GBP', 'pounds': 'GBP'
};

class OfferLetterParser {
  /**
   * Main parsing controller
   * @param {string} rawText - Unstructured string text extracted from pdf-parse
   */
  static parse(rawText) {
    const cleanText = (rawText || '').replace(/\s+/g, ' ');
    const normalizedText = cleanText.toLowerCase();

    const salaryAnalysis = this.extractSalaryMetrics(normalizedText, cleanText);
    const jobTitle = this.extractJobTitle(normalizedText, cleanText);
    const startDate = this.extractStartDate(normalizedText);

    return {
      success: salaryAnalysis.amount > 0,
      jobTitle,
      baseSalary: salaryAnalysis.monthlyEquivalent,
      currency: salaryAnalysis.currency,
      rawExtractedValue: salaryAnalysis.rawValue,
      matchedSnippet: salaryAnalysis.snippet,
      confidenceScore: salaryAnalysis.confidence,
      startDate: startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      intervalUsed: salaryAnalysis.interval
    };
  }

  static cleanNumericString(str) {
    let sanitized = str.replace(/[\s,]/g, '');
    
    // Convert Indian Lakh notation
    if (/lakh/i.test(sanitized)) {
      const multiplier = parseFloat(sanitized.replace(/lakhs?/i, '')) || 0;
      return multiplier * 100000;
    }
    return parseFloat(sanitized) || 0;
  }

  static extractSalaryMetrics(normalizedText, cleanText) {
    let amount = 0;
    let monthlyEquivalent = 0;
    let currency = 'INR';
    let rawValue = '';
    let snippet = '';
    let confidence = 0.0;
    let interval = 'monthly';

    // Heuristic Tiers
    const rules = [
      {
        name: 'Annual CTC Package',
        regex: /(?:ctc|package|annual compensation|annual base|salary of|remuneration of|annual gross|compensation)(?:[a-z\s]{0,40})?(?:is|of|valued\s*at|amounting\s*to)?\s*([^a-z0-9]*[\d,]+(?:\s*lakhs?)?)\s*(?:per\s*annum|p\.a\.|pa|\/year|\/yr|annually)/gi,
        interval: 'annual',
        weight: 0.95
      },
      {
        name: 'Monthly Stipend/Salary',
        regex: /(?:stipend|monthly stipend|monthly base|salary of|stipend of|allowance of|monthly compensation)(?:[a-z\s]{0,40})?(?:is|of|valued\s*at|amounting\s*to)?\s*([^a-z0-9]*[\d,]+(?:\s*lakhs?)?)\s*(?:per\s*month|p\.m\.|pm|\/month|\/mo|monthly)/gi,
        interval: 'monthly',
        weight: 0.90
      },
      {
        name: 'Standard Base Monthly Salary',
        regex: /(?:base salary|gross salary|basic pay|compensation of)(?:[a-z\s]{0,40})?(?:is|of)?\s*([^a-z0-9]*[\d,]+)\s*(?:per\s*month|p\.m\.|pm|\/month|\/mo|monthly)/gi,
        interval: 'monthly',
        weight: 0.85
      }
    ];

    for (const rule of rules) {
      rule.regex.lastIndex = 0;
      const match = rule.regex.exec(normalizedText);
      if (match && match[1]) {
        const rawPart = match[1].trim();
        const numberMatch = rawPart.match(/([\d,]+(?:\.\d+)?(?:\s*lakhs?)?)/i);

        if (numberMatch) {
          amount = this.cleanNumericString(numberMatch[1]);
          rawValue = match[0].trim();
          interval = rule.interval;
          confidence = rule.weight;

          // Context Slice (150 chars around hit)
          const startIdx = Math.max(0, match.index - 50);
          const endIdx = Math.min(cleanText.length, match.index + match[0].length + 100);
          snippet = `...${cleanText.substring(startIdx, endIdx).trim()}...`;

          // Resolve Currency
          const lowerSnippet = snippet.toLowerCase();
          for (const [symbol, iso] of Object.entries(CURRENCY_DICTIONARY)) {
            if (lowerSnippet.includes(symbol)) {
              currency = iso;
              break;
            }
          }
          break;
        }
      }
    }

    monthlyEquivalent = interval === 'annual' ? parseFloat((amount / 12).toFixed(2)) : amount;

    return { amount, monthlyEquivalent, currency, rawValue, snippet, confidence, interval };
  }

  static extractJobTitle(normalizedText, cleanText) {
    const regex = /(?:position of|role of|as a|designation as|appointed as|appointed to the position of)\s+([a-z\s]{3,40}?)(?:,|\.|\s+with|\s+at|\s+effective)/gi;
    const match = regex.exec(normalizedText);
    if (match && match[1]) {
      // Re-map back to proper text cases
      const rawMatch = cleanText.substring(match.index, match.index + match[0].length);
      const titleMatch = rawMatch.match(/(?:position of|role of|as a|designation as|appointed as|appointed to the position of)\s+([A-Za-z\s]{3,40}?)(?:,|\.|\s+with|\s+at|\s+effective)/i);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].replace(/\s+(with|at|in|for|from)$/i, '').trim();
      }
      return match[1].replace(/\s+(with|at|in|for|from)$/i, '').trim();
    }
    return 'Talent Associate';
  }

  static extractStartDate(normalizedText) {
    const regex = /(?:starting on|commencing on|start date|effective from)\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4})/gi;
    const match = regex.exec(normalizedText);
    if (match && match[1]) {
      const cleanDateStr = match[1].replace(/(st|nd|rd|th)/gi, '');
      const ts = Date.parse(cleanDateStr);
      if (!isNaN(ts)) {
        return new Date(ts);
      }
    }
    return new Date();
  }
}

module.exports = OfferLetterParser;
