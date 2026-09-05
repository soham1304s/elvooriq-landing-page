/**
 * Pre-Screening Audition Analysis Engine (ELVOORIQ Enterprise v6.0)
 * Evaluates candidate vocal pacing (WPM), cadence dynamics, energy index, and confidence score.
 */

const HIGH_VALUE_STREAMING_KEYWORDS = [
  'community', 'chat', 'engage', 'stream', 'live', 'content', 'schedule',
  'discord', 'followers', 'gaming', 'vlog', 'audience', 'brand', 'sponsor',
  'energy', 'broadcast', 'subs', 'monetization', 'vip', 'host', 'interaction'
];

/**
 * Analyzes audition transcript text and duration
 * @param {string} transcriptText
 * @param {number} rawDurationSec
 * @returns {object} Analysis metrics
 */
function analyzeVocalQualities(transcriptText = '', rawDurationSec = 60) {
  const safeText = String(transcriptText).trim();
  const durationSec = Math.max(15, Number(rawDurationSec) || 60);
  const durationMin = durationSec / 60;

  // 1. Calculate Words Per Minute (WPM)
  const words = safeText.length > 0 ? safeText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const rawWpm = durationMin > 0 ? Math.round(wordCount / durationMin) : 130;
  const wordsPerMinute = Math.min(260, Math.max(40, rawWpm));

  // 2. Cadence Scoring (Ideal Live Streaming Range: 125 - 160 WPM)
  let cadenceScore = 80;
  if (wordsPerMinute >= 125 && wordsPerMinute <= 155) {
    cadenceScore = 95 - Math.abs(140 - wordsPerMinute) * 0.5;
  } else if (wordsPerMinute >= 110 && wordsPerMinute < 125) {
    cadenceScore = 82 + (wordsPerMinute - 110);
  } else if (wordsPerMinute > 155 && wordsPerMinute <= 180) {
    cadenceScore = 90 - (wordsPerMinute - 155) * 0.8;
  } else if (wordsPerMinute < 110) {
    cadenceScore = Math.max(45, 75 - (110 - wordsPerMinute) * 0.7);
  } else {
    // > 180 WPM (Rushed)
    cadenceScore = Math.max(40, 70 - (wordsPerMinute - 180) * 0.6);
  }
  cadenceScore = Math.round(Math.min(99, Math.max(40, cadenceScore)));

  // 3. Vocal Energy & Enthusiasm Index (Punctuation, word diversity, exclamation)
  const exclamations = (safeText.match(/!/g) || []).length;
  const questions = (safeText.match(/\?/g) || []).length;
  const uppercaseWords = words.filter(w => w.length > 2 && w === w.toUpperCase()).length;
  
  let rawEnergy = 68;
  rawEnergy += Math.min(15, exclamations * 3.5);
  rawEnergy += Math.min(8, questions * 2);
  rawEnergy += Math.min(8, uppercaseWords * 2);
  if (wordsPerMinute > 130) rawEnergy += 5;
  const energyLevel = Math.round(Math.min(98, Math.max(50, rawEnergy)));

  // 4. Keyword Density & Matching
  const lowerText = safeText.toLowerCase();
  const matchedKeywords = [];
  HIGH_VALUE_STREAMING_KEYWORDS.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    const count = (lowerText.match(regex) || []).length;
    if (count > 0) {
      matchedKeywords.push({ keyword: kw, count });
    }
  });

  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / 5) * 100));

  // 5. Aggregate Confidence Rating (0 - 100%)
  const rawConfidence = (cadenceScore * 0.45) + (energyLevel * 0.35) + (keywordScore * 0.20);
  const confidenceScore = Math.round(Math.min(99, Math.max(45, rawConfidence)));

  // 6. Automated AI Evaluation Report
  let pacingAssessment = 'Optimal broadcast pace';
  if (wordsPerMinute < 115) pacingAssessment = 'Deliberate & calm, recommend accelerating delivery';
  else if (wordsPerMinute > 165) pacingAssessment = 'Rapid fire delivery, recommend natural pause breaks';

  let verdict = 'RECOMMENDED_FOR_OFFER';
  if (confidenceScore < 60) verdict = 'FLAGGED_FOR_REAUDITION';
  else if (confidenceScore < 75) verdict = 'PROBATIONARY_ROSTER';

  const aiSummary = `Candidate vocal pacing measured at ${wordsPerMinute} WPM (${pacingAssessment}). ` +
    `Demonstrates strong vocal energy (${energyLevel}%) with ${matchedKeywords.length} core streaming vocabulary touchpoints detected. ` +
    `Overall system confidence rating is ${confidenceScore}%. Verdict: ${verdict}.`;

  return {
    wordsPerMinute,
    cadenceScore,
    energyLevel,
    confidenceScore,
    keywordsMatched: JSON.stringify(matchedKeywords),
    aiSummary,
    verdict,
    durationSec
  };
}

module.exports = {
  analyzeVocalQualities,
  HIGH_VALUE_STREAMING_KEYWORDS
};
