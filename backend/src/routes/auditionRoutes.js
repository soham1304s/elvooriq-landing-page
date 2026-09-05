const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authorize = require('../middlewares/rbac');
const { analyzeVocalQualities } = require('../services/auditionEngine');

/**
 * GET /api/auditions/candidates
 * Lists all applicant leads along with their audition tape metrics
 */
router.get('/candidates', authorize(['ADMIN', 'EMPLOYEE']), async (req, res) => {
  try {
    let leads = await prisma.lead.findMany({
      include: {
        auditionTape: true,
        agent: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Auto-seed mock auditions if none have auditionTape yet
    const hasAuditions = leads.some(l => l.auditionTape);
    if (!hasAuditions && leads.length > 0) {
      await seedMockAuditionsInternal();
      leads = await prisma.lead.findMany({
        include: {
          auditionTape: true,
          agent: {
            select: { id: true, fullName: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return res.status(200).json({
      success: true,
      candidates: leads
    });
  } catch (error) {
    console.error('[Auditions] Error retrieving candidates:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auditions/lead/:id/audition
 * Submits or analyzes an audition tape for a candidate lead
 */
router.post('/lead/:id/audition', authorize(['ADMIN', 'EMPLOYEE']), async (req, res) => {
  try {
    const { id } = req.params;
    const { transcript, durationSec, fileUrl } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Candidate lead not found' });
    }

    const defaultTranscript = transcript || 
      `Hey everyone, welcome back to the live stream! Today we are diving into high energy gameplay, engaging with the chat community, and pushing through our competitive ranks. Make sure to drop a follow, join our Discord server, and let me know your thoughts in the comments! Huge shoutout to the community for tuning in today!`;

    const metrics = analyzeVocalQualities(defaultTranscript, durationSec || 75);

    const auditionTape = await prisma.auditionTape.upsert({
      where: { leadId: id },
      update: {
        fileUrl: fileUrl || 'https://assets.mixkit.co/videos/preview/mixkit-young-gamer-playing-online-42861-large.mp4',
        transcript: defaultTranscript,
        durationSec: metrics.durationSec,
        wordsPerMinute: metrics.wordsPerMinute,
        cadenceScore: metrics.cadenceScore,
        energyLevel: metrics.energyLevel,
        confidenceScore: metrics.confidenceScore,
        keywordsMatched: metrics.keywordsMatched,
        aiSummary: metrics.aiSummary,
        reviewerId: req.user?.id || null,
        status: metrics.confidenceScore >= 70 ? 'PENDING' : 'FLAGGED'
      },
      create: {
        leadId: id,
        fileUrl: fileUrl || 'https://assets.mixkit.co/videos/preview/mixkit-young-gamer-playing-online-42861-large.mp4',
        transcript: defaultTranscript,
        durationSec: metrics.durationSec,
        wordsPerMinute: metrics.wordsPerMinute,
        cadenceScore: metrics.cadenceScore,
        energyLevel: metrics.energyLevel,
        confidenceScore: metrics.confidenceScore,
        keywordsMatched: metrics.keywordsMatched,
        aiSummary: metrics.aiSummary,
        reviewerId: req.user?.id || null,
        status: 'PENDING'
      }
    });

    // Update lead status to INTERVIEWED
    await prisma.lead.update({
      where: { id },
      data: { status: 'INTERVIEWED' }
    });

    // Broadcast live telemetry via Socket.IO if available
    const io = req.app.get('socketio');
    if (io) {
      io.emit('audition:analyzed', {
        leadId: id,
        candidateName: lead.fullName,
        confidenceScore: metrics.confidenceScore,
        wordsPerMinute: metrics.wordsPerMinute
      });
    }

    return res.status(200).json({
      success: true,
      auditionTape,
      metrics
    });
  } catch (error) {
    console.error('[Auditions] Error processing audition:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auditions/:id/evaluate
 * Approves or Rejects an audition evaluation
 */
router.post('/:id/evaluate', authorize(['ADMIN', 'EMPLOYEE']), async (req, res) => {
  try {
    const { id } = req.params; // audition tape ID
    const { status, notes } = req.body; // 'APPROVED' or 'REJECTED'

    const audition = await prisma.auditionTape.findUnique({
      where: { id },
      include: { lead: true }
    });

    if (!audition) {
      return res.status(404).json({ success: false, message: 'Audition tape not found' });
    }

    const updatedAudition = await prisma.auditionTape.update({
      where: { id },
      data: {
        status: status || 'APPROVED',
        reviewerId: req.user?.id || null,
        aiSummary: notes ? `${audition.aiSummary || ''}\n[Reviewer Note]: ${notes}` : audition.aiSummary
      }
    });

    // If approved, candidate is set to SIGNED / ready for contract onboarding
    if (status === 'APPROVED') {
      await prisma.lead.update({
        where: { id: audition.leadId },
        data: { status: 'SIGNED' }
      });
    } else if (status === 'REJECTED') {
      await prisma.lead.update({
        where: { id: audition.leadId },
        data: { status: 'REJECTED' }
      });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('audition:evaluated', {
        auditionId: id,
        leadId: audition.leadId,
        status: updatedAudition.status
      });
    }

    return res.status(200).json({
      success: true,
      audition: updatedAudition
    });
  } catch (error) {
    console.error('[Auditions] Evaluation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Internal helper to seed mock auditions for existing leads
 */
async function seedMockAuditionsInternal() {
  const leads = await prisma.lead.findMany({ take: 6 });
  const mockScripts = [
    {
      transcript: "What is up chat! Welcome to tonight's stream! Today we are grinding competitive ranked, pushing our game sense to the absolute limit. Make sure to engage, hit that follow button, join our Discord community, and let's smash our goals together! Let's get right into the action!",
      duration: 65,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    {
      transcript: "Hello everyone, welcome back. In this session we will do an in-depth hardware review and live gameplay benchmark. We'll be interacting with chat continuously, breaking down sponsor gear, and discussing creator career paths. Thank you to our subscribers for the support!",
      duration: 85,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    },
    {
      transcript: "Yo! We are live right now! Drop a sub, hype up the chat with emotes! Today's schedule is packed: 3 hours of Battle Royale, live viewer custom lobbies, and giving away exclusive merch courtesy of our brand partners! Let's go!",
      duration: 50,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    },
    {
      transcript: "Good evening stream family. Taking it easy today with acoustic music and chill vibes. We are chatting about community events, upcoming conventions, and answering audience AMA questions in real-time.",
      duration: 110,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"
    }
  ];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const script = mockScripts[i % mockScripts.length];
    const metrics = analyzeVocalQualities(script.transcript, script.duration);

    await prisma.auditionTape.upsert({
      where: { leadId: lead.id },
      update: {
        fileUrl: script.videoUrl,
        transcript: script.transcript,
        durationSec: metrics.durationSec,
        wordsPerMinute: metrics.wordsPerMinute,
        cadenceScore: metrics.cadenceScore,
        energyLevel: metrics.energyLevel,
        confidenceScore: metrics.confidenceScore,
        keywordsMatched: metrics.keywordsMatched,
        aiSummary: metrics.aiSummary,
        status: i === 0 ? 'APPROVED' : (metrics.confidenceScore > 75 ? 'PENDING' : 'FLAGGED')
      },
      create: {
        leadId: lead.id,
        fileUrl: script.videoUrl,
        transcript: script.transcript,
        durationSec: metrics.durationSec,
        wordsPerMinute: metrics.wordsPerMinute,
        cadenceScore: metrics.cadenceScore,
        energyLevel: metrics.energyLevel,
        confidenceScore: metrics.confidenceScore,
        keywordsMatched: metrics.keywordsMatched,
        aiSummary: metrics.aiSummary,
        status: i === 0 ? 'APPROVED' : (metrics.confidenceScore > 75 ? 'PENDING' : 'FLAGGED')
      }
    });
  }
}

/**
 * POST /api/auditions/seed-mock
 * Explicit seed endpoint
 */
router.post('/seed-mock', authorize(['ADMIN', 'EMPLOYEE']), async (req, res) => {
  try {
    await seedMockAuditionsInternal();
    return res.status(200).json({ success: true, message: 'Mock audition tapes seeded successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
