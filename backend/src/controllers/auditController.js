const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Creates an evaluation record for a creator
 */
const submitChannelAudit = async (req, res) => {
  const { 
    creatorId, 
    videoQuality, 
    audioClarity, 
    engagementRate, 
    brandingOverlay, 
    scheduleAdherence,
    qualitativeComments,
    actionPlan
  } = req.body;
  
  const agentId = req.user.id; // Talent Agent ID decoded from JWT

  try {
    // Check if target creator exists
    const creatorUser = await prisma.user.findFirst({
      where: { id: creatorId, role: "CREATOR" }
    });

    if (!creatorUser) {
      return res.status(404).json({ success: false, message: "Agency creator profile not found." });
    }

    // Parse metric bounds (scores must fall between 0 and 10 points)
    const vq = Math.max(0, Math.min(10, parseInt(videoQuality) || 0));
    const ac = Math.max(0, Math.min(10, parseInt(audioClarity) || 0));
    const er = Math.max(0, Math.min(10, parseInt(engagementRate) || 0));
    const bo = Math.max(0, Math.min(10, parseInt(brandingOverlay) || 0));
    const sa = Math.max(0, Math.min(10, parseInt(scheduleAdherence) || 0));

    // Calculate Overall Average Score
    const overallAuditScore = parseFloat(((vq + ac + er + bo + sa) / 5).toFixed(2));

    if (!qualitativeComments || !actionPlan) {
      return res.status(400).json({
        success: false,
        message: "Qualitative evaluation comments and action plan are required."
      });
    }

    const audit = await prisma.channelAudit.create({
      data: {
        creatorId,
        agentId,
        videoQuality: vq,
        audioClarity: ac,
        engagementRate: er,
        brandingOverlay: bo,
        scheduleAdherence: sa,
        overallAuditScore,
        qualitativeComments,
        actionPlan
      },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true, platform: true }
        },
        agent: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Channel audit created and committed to workspace telemetry successfully.",
      audit
    });

  } catch (error) {
    console.error("Channel audit submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record creator channel audit.",
      error: error.message
    });
  }
};

/**
 * Retrieves all audits for a creator (trendline and history)
 */
const getCreatorAudits = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const audits = await prisma.channelAudit.findMany({
      where: { creatorId },
      include: {
        agent: { select: { id: true, fullName: true, email: true } },
        creator: { select: { id: true, fullName: true, email: true, platform: true } }
      },
      orderBy: { auditDate: 'desc' }
    });

    return res.status(200).json({ success: true, audits });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve audits.", error: error.message });
  }
};

/**
 * Retrieves recent audits across the agency
 */
const getAllAudits = async (req, res) => {
  try {
    const audits = await prisma.channelAudit.findMany({
      include: {
        creator: { select: { id: true, fullName: true, email: true, platform: true } },
        agent: { select: { id: true, fullName: true, email: true } }
      },
      orderBy: { auditDate: 'desc' },
      take: 50
    });

    return res.status(200).json({ success: true, audits });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to list audits.", error: error.message });
  }
};

module.exports = { submitChannelAudit, getCreatorAudits, getAllAudits };
