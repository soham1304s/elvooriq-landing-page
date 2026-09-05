const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { parse } = require('csv-parse/sync');

/**
 * Standardizes raw numbers from multi-currency formats ($12,450.00 -> 12450.00)
 */
const parseCleanRevenue = (amountStr) => {
  if (amountStr === undefined || amountStr === null) return 0.0;
  if (typeof amountStr === 'number') return amountStr;
  const cleaned = String(amountStr).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0.0;
};

/**
 * Parses dynamic monthly platform payouts from a CSV upload.
 * CSV Format Expected: CreatorPlatformId, PlatformName, GrossRevenueUSD
 */
const ingestPlatformEarningsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No statement CSV file provided." });
    }

    const { billingCycle, commissionRate } = req.body;
    if (!billingCycle) {
      return res.status(400).json({ success: false, message: "Billing cycle (e.g. September-2026) is required." });
    }

    const defaultAgencyRate = commissionRate ? parseFloat(commissionRate) : 30.0;

    // Load file from memory buffer and parse CSV
    const rawCSV = req.file.buffer.toString('utf-8');
    const records = parse(rawCSV, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const results = [];
    const skippedRecords = [];

    // Run atomic splits transaction
    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        // Support multiple common column name variants
        const platformId = record.CreatorPlatformId || record.creatorPlatformId || record.PlatformId || record.platformId;
        const platformName = record.PlatformName || record.platformName || record.platform || "TikTok";
        const grossRaw = record.GrossRevenueUSD || record.grossRevenueUSD || record.GrossRevenue || record.grossRevenue || record.Revenue || record.revenue;
        const grossRevenue = parseCleanRevenue(grossRaw);

        if (!platformId || grossRevenue <= 0) {
          skippedRecords.push({ record, reason: "Missing identification or zero revenue." });
          continue;
        }

        // Identify matching User (by platformId or fallback email/id)
        const matchedCreator = await tx.user.findFirst({
          where: {
            OR: [
              { platformId: String(platformId) },
              { email: String(platformId) },
              { id: String(platformId) }
            ],
            role: "CREATOR",
            status: "ACTIVE"
          }
        });

        if (!matchedCreator) {
          skippedRecords.push({ record, reason: `No active creator matches platformId [${platformId}]` });
          continue;
        }

        // Identify assigned talent agent/employee inside workspace mapping
        const workspaceMembership = await tx.workspaceMember.findFirst({
          where: { userId: matchedCreator.id },
          include: {
            workspace: {
              include: {
                members: {
                  include: { user: true }
                }
              }
            }
          }
        });

        // Find Employee Agent in the same workspace to route commission bonus
        let assignedAgentId = null;
        if (workspaceMembership && workspaceMembership.workspace && workspaceMembership.workspace.members) {
          const agentMember = workspaceMembership.workspace.members.find(
            m => m.user && m.user.role === "EMPLOYEE" && m.user.status === "ACTIVE"
          );
          if (agentMember) {
            assignedAgentId = agentMember.userId;
          }
        }

        // Calculate Splits
        const agencyCut = parseFloat((grossRevenue * (defaultAgencyRate / 100)).toFixed(2));
        const creatorCut = parseFloat((grossRevenue - agencyCut).toFixed(2));
        
        // Agent gets 5% bonus from agency's commission share
        const agentBonus = assignedAgentId ? parseFloat((agencyCut * 0.05).toFixed(2)) : 0.0;

        // Commit Split Record
        const splitRecord = await tx.revenueSplit.create({
          data: {
            userId: matchedCreator.id,
            platform: platformName,
            billingCycle,
            grossRevenue,
            commissionRate: defaultAgencyRate,
            agencyCut,
            creatorCut,
            agentBonus
          }
        });

        results.push({
          splitId: splitRecord.id,
          creatorId: matchedCreator.id,
          creatorName: matchedCreator.fullName || matchedCreator.name || matchedCreator.email,
          platformId,
          platform: platformName,
          grossRevenue,
          agencyCut,
          creatorCut,
          agentBonus,
          bonusRoutedTo: assignedAgentId ? `Agent_${assignedAgentId}` : "None"
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: `Commission sheet processing complete. Validated and routed splits.`,
      splitsProcessedCount: results.length,
      skippedCount: skippedRecords.length,
      processedDetails: results,
      skippedDetails: skippedRecords
    });

  } catch (error) {
    console.error("Commission CSV parsing error:", error);
    return res.status(500).json({
      success: false,
      message: "Split-sheet transactional parsing failed.",
      error: error.message
    });
  }
};

/**
 * Retrieves revenue splits with filtering for administrative display
 */
const getRevenueSplits = async (req, res) => {
  try {
    const { billingCycle, platform, isSyncedToPay } = req.query;
    const where = {};
    if (billingCycle) where.billingCycle = billingCycle;
    if (platform) where.platform = platform;
    if (isSyncedToPay !== undefined) where.isSyncedToPay = isSyncedToPay === 'true';

    const splits = await prisma.revenueSplit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            platformId: true,
            platform: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Compute aggregated metrics
    const totalGross = splits.reduce((acc, s) => acc + (s.grossRevenue || 0), 0);
    const totalAgencyCut = splits.reduce((acc, s) => acc + (s.agencyCut || 0), 0);
    const totalAgentBonuses = splits.reduce((acc, s) => acc + (s.agentBonus || 0), 0);
    const unsyncedCount = splits.filter(s => !s.isSyncedToPay).length;

    return res.status(200).json({
      success: true,
      splits,
      analytics: {
        totalGross: parseFloat(totalGross.toFixed(2)),
        totalAgencyCut: parseFloat(totalAgencyCut.toFixed(2)),
        totalAgentBonuses: parseFloat(totalAgentBonuses.toFixed(2)),
        unsyncedCount,
        totalRecords: splits.length
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve revenue splits.", error: error.message });
  }
};

/**
 * Syncs split with payroll ledger
 */
const syncSplitToPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const split = await prisma.revenueSplit.update({
      where: { id },
      data: { isSyncedToPay: true }
    });
    return res.status(200).json({ success: true, message: "Split synced to payroll.", split });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to sync split.", error: error.message });
  }
};

module.exports = { ingestPlatformEarningsCSV, getRevenueSplits, syncSplitToPayroll };
