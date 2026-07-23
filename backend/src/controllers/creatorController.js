exports.getCreators = async (req, res) => {
  try {
    const prisma = req.prisma;
    const creators = await prisma.featuredCreator.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, creators });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addCreator = async (req, res) => {
  try {
    const { name, handle, followers } = req.body;
    const prisma = req.prisma;

    if (!name || !handle || !followers) {
      return res.status(400).json({ success: false, message: 'Name, handle, and followers are required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    // req.file.path contains the URL from Cloudinary because of multer-storage-cloudinary
    const imageUrl = req.file.path;

    const newCreator = await prisma.featuredCreator.create({
      data: {
        name,
        handle,
        followers,
        imageUrl,
      }
    });

    if (req.io) {
      req.io.emit('content:updated', { type: 'creator', action: 'add', data: newCreator });
    }

    res.status(201).json({ success: true, creator: newCreator });
  } catch (error) {
    console.error('Error adding creator:', error);
    require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + (error.stack || error) + '\n');
    res.status(500).json({ success: false, message: 'Server error', error: error.toString() });
  }
};

exports.deleteCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;

    await prisma.featuredCreator.delete({
      where: { id }
    });

    if (req.io) {
      req.io.emit('content:updated', { type: 'creator', action: 'delete', id });
    }

    res.status(200).json({ success: true, message: 'Creator deleted successfully' });
  } catch (error) {
    console.error('Error deleting creator:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
