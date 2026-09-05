const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFeaturedVideo = async (req, res) => {
  try {
    const video = await prisma.featuredVideo.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(video || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeaturedVideos = async (req, res) => {
  try {
    const videos = await prisma.featuredVideo.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getYouTubeId = (urlOrId) => {
  if (!urlOrId) return null;
  const normalized = urlOrId.trim();
  const regex = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?&]+).*/;
  const match = normalized.match(regex);
  const candidate = match && match[1] ? match[1] : normalized;
  return candidate && candidate.length === 11 ? candidate : null;
};

const normalizeYouTubeUrl = (urlOrId) => {
  const videoId = getYouTubeId(urlOrId);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
};

exports.updateFeaturedVideo = async (req, res) => {
  try {
    const { youtubeUrl, title } = req.body;
    const normalizedUrl = normalizeYouTubeUrl(youtubeUrl);

    if (!normalizedUrl) {
      return res.status(400).json({ error: 'Invalid YouTube video ID or URL.' });
    }

    const newVideo = await prisma.featuredVideo.create({
      data: {
        youtubeUrl: normalizedUrl,
        title,
        isActive: true
      }
    });

    // Emit socket event to frontend
    if (req.io) {
      const videos = await prisma.featuredVideo.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });
      req.io.emit('landing:featured_videos_update', videos);
    }

    res.json(newVideo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFeaturedVideo = async (req, res) => {
  try {
    await prisma.featuredVideo.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    if (req.io) {
      req.io.emit('landing:featured_videos_update', []);
    }

    res.json({ message: 'Featured video removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFeaturedVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.featuredVideo.updateMany({
      where: { id, isActive: true },
      data: { isActive: false }
    });

    const videos = await prisma.featuredVideo.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });

    if (req.io) {
      req.io.emit('landing:featured_videos_update', videos);
    }

    res.json({ message: 'Featured video removed', videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
