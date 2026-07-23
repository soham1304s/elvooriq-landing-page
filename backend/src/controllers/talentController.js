exports.getTalent = async (req, res) => {
  try {
    const prisma = req.prisma;
    const talents = await prisma.featuredTalent.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 4 // Max 4 items based on the design
    });

    const formattedTalents = talents.map(t => {
      let badges = [];
      if (typeof t.badges === 'string') {
        try { badges = JSON.parse(t.badges); } catch (e) { badges = []; }
      } else if (Array.isArray(t.badges)) {
        badges = t.badges;
      }
      return { ...t, badges };
    });

    res.status(200).json({ success: true, talents: formattedTalents });
  } catch (error) {
    console.error('Error fetching talent:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addTalent = async (req, res) => {
  try {
    const { name, handle, category, platform, followers, badges } = req.body;
    const prisma = req.prisma;

    if (!name || !handle || !category || !platform || !followers) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const imageUrl = req.file.path;
    const badgesArray = badges ? badges.split(',').map(b => b.trim()).filter(b => b) : [];

    const newTalent = await prisma.featuredTalent.create({
      data: {
        name,
        handle,
        category,
        platform,
        followers,
        badges: JSON.stringify(badgesArray),
        imageUrl,
      }
    });

    if (req.io) {
      req.io.emit('content:updated', { type: 'talent', action: 'add', data: newTalent });
    }

    res.status(201).json({ success: true, talent: newTalent });
  } catch (error) {
    console.error('Error adding talent:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteTalent = async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;

    await prisma.featuredTalent.delete({
      where: { id }
    });

    if (req.io) {
      req.io.emit('content:updated', { type: 'talent', action: 'delete', id });
    }

    res.status(200).json({ success: true, message: 'Talent deleted successfully' });
  } catch (error) {
    console.error('Error deleting talent:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
