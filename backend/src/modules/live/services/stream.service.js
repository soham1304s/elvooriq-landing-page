const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const youtubeService = require('./youtube.service');
const ffmpegService = require('./ffmpeg.service');

class StreamService {
  async getSettings(userId) {
    let settings = await prisma.creatorStreamingSetting.findUnique({ where: { userId } });
    if (!settings) { settings = await prisma.creatorStreamingSetting.create({ data: { userId } }); }
    return settings;
  }
  
  async createLiveSession(userId, data) {
    const { title, description, category, visibility } = data;
    const session = await prisma.liveSession.create({
      data: { userId, title, description, category, visibility, status: 'created' }
    });
    return { session, rtmpUrl: '' };
  }

  async startStream(userId, sessionId, rtmpUrl) {
    ffmpegService.startProcess(sessionId, rtmpUrl);
    return await prisma.liveSession.update({ where: { id: sessionId }, data: { status: 'starting' } });
  }

  async stopStream(userId, sessionId) {
    ffmpegService.stopProcess(sessionId);
    return await prisma.liveSession.update({ where: { id: sessionId }, data: { status: 'ended' } });
  }
}

module.exports = new StreamService();
