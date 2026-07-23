exports.getAllUsers = async (req, res) => {
  try {
    const prisma = req.prisma;
    
    // Fetch all users, selecting only necessary fields to not send passwords
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        platform: true,
        whatsapp: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};
