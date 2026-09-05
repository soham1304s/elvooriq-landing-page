const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

class YouTubeService {
  getAuthUrl(userId) {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: userId,
    });
  }

  async handleCallback(code, userId) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelRes = await youtube.channels.list({ part: 'snippet', mine: true });
    const channel = channelRes.data.items[0];

    await prismaClient.youTubeConnection.upsert({
      where: { userId },
      update: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, channelId: channel.id, channelTitle: channel.snippet.title },
      create: { userId, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, channelId: channel.id, channelTitle: channel.snippet.title },
    });
    return tokens;
  }
}

module.exports = new YouTubeService();
