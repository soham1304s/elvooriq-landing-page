const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const verifyWebhookSignature = require('../middlewares/webhookVerify');

/**
 * Handle Stream lifecycle state webhook notifications from external streaming platforms.
 */
router.post('/platform-stream-status', verifyWebhookSignature, async (req, res) => {
  const { eventType, creatorPlatformId, platform, streamTitle, timestamp, streamId, viewers } = req.body;
  const io = req.app.get('socketio') || req.io;

  try {
    // 1. Identify active agency creator
    const creator = await prisma.user.findFirst({
      where: {
        OR: [
          { platformId: creatorPlatformId },
          { id: creatorPlatformId },
          { email: creatorPlatformId }
        ],
        role: "CREATOR"
      }
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: `Received event for unregistered creator platform ID: ${creatorPlatformId}`
      });
    }

    const eventTime = timestamp ? new Date(timestamp) : new Date();
    const resolvedPlatform = platform || creator.platform || "Twitch";
    const creatorName = creator.fullName || creator.name || creator.email;

    if (eventType === "stream.online") {
      // Create new active stream logging entry
      const activeStream = await prisma.streamLog.create({
        data: {
          creatorId: creator.id,
          platform: resolvedPlatform,
          streamTitle: streamTitle || "Live Creator Stream",
          startedAt: eventTime,
          isLive: true,
          peakViewers: viewers || 0,
          avgViewers: viewers || 0,
          historicalKey: streamId ? String(streamId) : `stream_${Date.now()}`
        }
      });

      // Broadcast Socket event to the assigned Workspace Room
      const userWorkspace = await prisma.workspaceMember.findFirst({
        where: { userId: creator.id }
      });

      if (userWorkspace && io) {
        io.to(`workspace-${userWorkspace.workspaceId}`).emit('stream:started', {
          creatorId: creator.id,
          creatorName,
          streamId: activeStream.id,
          streamTitle: activeStream.streamTitle,
          platform: resolvedPlatform,
          currentViewers: viewers || 0
        });
      }

      // Also notify admin room for high-level monitoring
      if (io) {
        io.to('admin_room').emit('telemetry:stream', {
          type: 'STREAM_STARTED',
          creatorName,
          platform: resolvedPlatform,
          streamTitle: activeStream.streamTitle,
          timestamp: eventTime.toISOString()
        });
      }

      return res.status(200).json({
        success: true,
        message: "Stream online telemetry captured and broadcasted.",
        stream: activeStream
      });
    } 
    
    else if (eventType === "stream.offline") {
      // Find open stream log entry
      const openStream = await prisma.streamLog.findFirst({
        where: { creatorId: creator.id, platform: resolvedPlatform, isLive: true },
        orderBy: { startedAt: 'desc' }
      });

      let durationMin = 0;
      if (openStream) {
        durationMin = Math.round(((eventTime - new Date(openStream.startedAt)) / 1000 / 60) * 100) / 100;
        if (durationMin < 0) durationMin = 0;

        await prisma.streamLog.update({
          where: { id: openStream.id },
          data: {
            endedAt: eventTime,
            isLive: false,
            durationMin
          }
        });
      }

      // Broadcast termination to the Workspace
      const userWorkspace = await prisma.workspaceMember.findFirst({
        where: { userId: creator.id }
      });

      if (userWorkspace && io) {
        io.to(`workspace-${userWorkspace.workspaceId}`).emit('stream:stopped', {
          creatorId: creator.id,
          creatorName,
          duration: durationMin,
          platform: resolvedPlatform
        });
      }

      if (io) {
        io.to('admin_room').emit('telemetry:stream', {
          type: 'STREAM_STOPPED',
          creatorName,
          platform: resolvedPlatform,
          durationMin,
          timestamp: eventTime.toISOString()
        });
      }

      return res.status(200).json({
        success: true,
        message: "Stream offline telemetry recorded and broadcasted.",
        durationMin
      });
    }

    else if (eventType === "stream.update") {
      // Periodic viewer pulse update
      const openStream = await prisma.streamLog.findFirst({
        where: { creatorId: creator.id, platform: resolvedPlatform, isLive: true },
        orderBy: { startedAt: 'desc' }
      });

      if (openStream) {
        const currentViewers = viewers || 0;
        const newPeak = Math.max(openStream.peakViewers, currentViewers);
        const newAvg = parseFloat(((openStream.avgViewers + currentViewers) / 2).toFixed(1));

        await prisma.streamLog.update({
          where: { id: openStream.id },
          data: {
            peakViewers: newPeak,
            avgViewers: newAvg
          }
        });

        const userWorkspace = await prisma.workspaceMember.findFirst({
          where: { userId: creator.id }
        });

        if (userWorkspace && io) {
          io.to(`workspace-${userWorkspace.workspaceId}`).emit('stream:updated', {
            creatorId: creator.id,
            creatorName,
            currentViewers,
            peakViewers: newPeak,
            avgViewers: newAvg,
            platform: resolvedPlatform
          });
        }
      }

      return res.status(200).json({ success: true, message: "Stream telemetry updated." });
    }

    return res.status(400).json({ success: false, message: `Unsupported eventType: ${eventType}` });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process platform streaming status update.",
      error: error.message
    });
  }
});

/**
 * Endpoint to fetch active streams across all creators or for a workspace
 */
router.get('/active', async (req, res) => {
  try {
    const activeStreams = await prisma.streamLog.findMany({
      where: { isLive: true },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            platform: true,
            platformId: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    return res.status(200).json({ success: true, activeStreams });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch active streams.", error: error.message });
  }
});

/**
 * Endpoint to fetch historical streams for a creator
 */
router.get('/history/:creatorId', async (req, res) => {
  try {
    const { creatorId } = req.params;
    const history = await prisma.streamLog.findMany({
      where: { creatorId },
      orderBy: { startedAt: 'desc' },
      take: 50
    });

    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch stream history.", error: error.message });
  }
});

module.exports = router;
