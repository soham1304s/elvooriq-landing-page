const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Computes a linear regression best-fit line to project creator metrics.
 * Equation: y = mx + c
 */
const calculateLinearRegression = (dataPoints) => {
  const n = dataPoints.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += dataPoints[i].x;
    sumY += dataPoints[i].y;
    sumXY += dataPoints[i].x * dataPoints[i].y;
    sumXX += dataPoints[i].x * dataPoints[i].x;
  }

  const denominator = (n * sumXX - sumX * sumX);
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

/**
 * Aggregates historic stream metrics and generates a predictive growth projection.
 */
const getCreatorGrowthForecast = async (req, res) => {
  const creatorId = req.params.id;

  try {
    const creator = await prisma.user.findFirst({
      where: { id: creatorId, role: "CREATOR" }
    });

    if (!creator) {
      return res.status(404).json({ success: false, message: "Specified creator not found." });
    }

    // Fetch historical stream records sorted chronologically
    let streamHistory = await prisma.streamLog.findMany({
      where: { creatorId, isLive: false },
      orderBy: { startedAt: 'asc' },
      take: 50 // Pull up to 50 stream sessions
    });

    if (streamHistory.length < 5) {
      return res.status(200).json({
        success: false,
        message: "Insufficient historical data. Creator must complete at least 5 streams to calculate a performance trajectory.",
        historicalPointsCount: streamHistory.length,
        creatorName: creator.fullName || creator.name || creator.email
      });
    }

    // 1. Map stream indexes to average viewer metrics for linear modeling
    const averageViewerPoints = streamHistory.map((stream, idx) => ({
      x: idx + 1,
      y: stream.avgViewers || stream.peakViewers || 10
    }));

    const viewerModel = calculateLinearRegression(averageViewerPoints);
    if (!viewerModel) {
      return res.status(500).json({ success: false, message: "Failed to compile trend projections." });
    }

    // 2. Map stream indexes to stream durations for baseline consistency modeling
    const durationPoints = streamHistory.map((stream, idx) => ({
      x: idx + 1,
      y: stream.durationMin > 0 ? stream.durationMin : 60
    }));

    const durationModel = calculateLinearRegression(durationPoints);

    // 3. Generate future 5-session forecast projections
    const projections = [];
    const lastIndex = averageViewerPoints.length;

    for (let i = 1; i <= 5; i++) {
      const nextX = lastIndex + i;
      const projectedViewers = Math.max(0, Math.round((viewerModel.slope * nextX + viewerModel.intercept) * 10) / 10);
      const projectedDuration = durationModel 
        ? Math.max(0, Math.round((durationModel.slope * nextX + durationModel.intercept) * 10) / 10)
        : 120.0;

      projections.push({
        projectedSessionIndex: nextX,
        projectedAverageViewers: projectedViewers,
        projectedDurationMinutes: projectedDuration
      });
    }

    // 4. Calculate Talent Tier Recommendation
    let growthRateIndicator = viewerModel.slope > 0 ? "EXPANDING" : "STAGNANT";
    let talentTier = "C - STANDARD ROSTER";

    if (viewerModel.slope > 1.5) {
      talentTier = "A+ - HIGH VELOCITY BREAKOUT";
    } else if (viewerModel.slope > 0.5) {
      talentTier = "B - STEADY GROWTH";
    }

    return res.status(200).json({
      success: true,
      creatorId,
      creatorName: creator.fullName || creator.name || creator.email,
      historicalPointsAnalyzed: lastIndex,
      performanceGrowthRate: Math.round(viewerModel.slope * 100) / 100, // Average viewer growth per session
      growthRateIndicator,
      recommendedTalentTier: talentTier,
      historicalSessions: streamHistory.map((s, idx) => ({
        index: idx + 1,
        startedAt: s.startedAt,
        avgViewers: s.avgViewers,
        peakViewers: s.peakViewers,
        durationMin: s.durationMin,
        platform: s.platform
      })),
      forecastedNextSessions: projections
    });

  } catch (error) {
    console.error("Forecast generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate predictive creator projections.",
      error: error.message
    });
  }
};

/**
 * Development / Evaluation helper to seed streams for regression verification
 */
const seedCreatorStreams = async (req, res) => {
  try {
    const creatorId = req.params.id;
    const { count = 7, baseViewers = 150, growthStep = 25 } = req.body;

    const creator = await prisma.user.findFirst({ where: { id: creatorId, role: "CREATOR" } });
    if (!creator) {
      return res.status(404).json({ success: false, message: "Creator not found." });
    }

    const created = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      const startTime = new Date(now - (count - i) * 86400000);
      const endTime = new Date(startTime.getTime() + (90 + i * 5) * 60000);
      const viewers = baseViewers + (i * growthStep) + Math.floor(Math.random() * 15);
      
      const log = await prisma.streamLog.create({
        data: {
          creatorId,
          platform: creator.platform || "Twitch",
          streamTitle: `Stream Session #${i + 1}`,
          startedAt: startTime,
          endedAt: endTime,
          durationMin: parseFloat(((endTime - startTime) / 60000).toFixed(1)),
          peakViewers: viewers + 45,
          avgViewers: viewers,
          isLive: false,
          historicalKey: `seed_${startTime.getTime()}`
        }
      });
      created.push(log);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully seeded ${created.length} historical stream logs for forecasting.`,
      count: created.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to seed streams.", error: error.message });
  }
};

module.exports = { getCreatorGrowthForecast, seedCreatorStreams };
