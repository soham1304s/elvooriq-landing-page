const streamService = require('../services/stream.service');
const youtubeService = require('../services/youtube.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In a real app we'd get userId from auth middleware (req.user.id). 
// Since auth isn't fully connected here for live, we simulate or expect it in body/headers.

exports.getSettings = async (req, res) => {
  try {
    const userId = req.body.userId || 'mock-user-id'; 
    const settings = await streamService.getSettings(userId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.connectYouTube = async (req, res) => {
  try {
    const userId = req.body.userId || 'mock-user-id';
    const url = youtubeService.getAuthUrl(userId);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.youtubeCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state || 'mock-user-id';
    await youtubeService.handleCallback(code, userId);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/live-studio?youtube=connected`);
  } catch (error) {
    res.status(500).send('YouTube authentication failed: ' + error.message);
  }
};

exports.createBroadcast = async (req, res) => {
  try {
    const userId = req.body.userId || 'mock-user-id';
    const { title, description, category, visibility } = req.body;
    const result = await streamService.createLiveSession(userId, { title, description, category, visibility });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.startStream = async (req, res) => {
  try {
    const userId = req.body.userId || 'mock-user-id';
    const { sessionId, rtmpUrl } = req.body;
    const session = await streamService.startStream(userId, sessionId, rtmpUrl);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.stopStream = async (req, res) => {
  try {
    const userId = req.body.userId || 'mock-user-id';
    const { sessionId } = req.body;
    const session = await streamService.stopStream(userId, sessionId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: { analytics: { orderBy: { timestamp: 'desc' }, take: 1 } }
    });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
