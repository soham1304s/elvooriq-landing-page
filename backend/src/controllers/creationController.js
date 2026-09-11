const crypto = require('crypto');

// 1. Get Creations Feed / List
exports.getCreations = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { 
      category, 
      contentType, 
      creatorId, 
      status = 'PUBLISHED', 
      visibility,
      limit = 20, 
      offset = 0 
    } = req.query;

    const where = {};
    if (category) where.category = category;
    if (contentType) where.contentType = contentType;
    if (creatorId) where.creatorId = creatorId;
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;

    const [total, creations] = await Promise.all([
      prisma.creation.count({ where }),
      prisma.creation.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              handle: true,
              avatarUrl: true,
              niche: true,
              isVerified: true
            }
          },
          assets: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              tips: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      })
    ]);

    res.json({
      success: true,
      total,
      creations
    });
  } catch (error) {
    console.error('Error fetching creations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch creations' });
  }
};

// 2. Get Single Creation by ID or Slug
exports.getCreation = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    const creation = await prisma.creation.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            handle: true,
            avatarUrl: true,
            bannerUrl: true,
            niche: true,
            isVerified: true,
            bio: true
          }
        },
        assets: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                handle: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!creation) {
      return res.status(404).json({ success: false, message: 'Creation not found' });
    }

    // Increment view count asynchronously
    prisma.creation.update({
      where: { id: creation.id },
      data: { viewCount: { increment: 1 } }
    }).catch(err => console.warn('View increment notice:', err.message));

    res.json({
      success: true,
      creation
    });
  } catch (error) {
    console.error('Error fetching creation:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch creation' });
  }
};

// 3. Create New Creative Work
exports.createCreation = async (req, res) => {
  try {
    const prisma = req.prisma;
    const creatorId = req.user.id;
    const {
      title,
      slug,
      summary,
      content,
      contentType = 'VIDEO',
      mediaUrl,
      thumbnailUrl,
      previewUrl,
      status = 'PUBLISHED',
      visibility = 'PUBLIC',
      category = 'GENERAL',
      tags = []
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Creation title is required' });
    }

    // Generate unique slug if not supplied
    const baseSlug = (slug || title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const finalSlug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? tags : '[]');

    const creation = await prisma.creation.create({
      data: {
        creatorId,
        title,
        slug: finalSlug,
        summary,
        content,
        contentType,
        mediaUrl,
        thumbnailUrl,
        previewUrl,
        status,
        visibility,
        category,
        tags: tagsJson,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      }
    });

    // Record Activity
    prisma.userActivityLog.create({
      data: {
        userId: creatorId,
        action: 'CREATION_PUBLISH',
        resourceType: 'CREATION',
        resourceId: creation.id,
        details: JSON.stringify({ title: creation.title, contentType: creation.contentType })
      }
    }).catch(e => {});

    res.status(201).json({
      success: true,
      message: 'Creation published successfully',
      creation
    });
  } catch (error) {
    console.error('Error creating creation:', error);
    res.status(500).json({ success: false, message: 'Failed to create creation', error: error.message });
  }
};

// 4. Like / Unlike Creation
exports.toggleLike = async (req, res) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.creationLike.findUnique({
      where: {
        creationId_userId: {
          creationId: id,
          userId
        }
      }
    });

    if (existing) {
      await prisma.creationLike.delete({
        where: { id: existing.id }
      });
      await prisma.creation.update({
        where: { id },
        data: { likeCount: { decrement: 1 } }
      });
      return res.json({ success: true, liked: false, message: 'Creation unliked' });
    } else {
      await prisma.creationLike.create({
        data: { creationId: id, userId }
      });
      await prisma.creation.update({
        where: { id },
        data: { likeCount: { increment: 1 } }
      });
      return res.json({ success: true, liked: true, message: 'Creation liked' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Failed to update like status' });
  }
};

// 5. Add Discussion Comment
exports.addComment = async (req, res) => {
  try {
    const prisma = req.prisma;
    const userId = req.user.id;
    const { id } = req.params;
    const { content, parentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const comment = await prisma.creationComment.create({
      data: {
        creationId: id,
        userId,
        parentId: parentId || null,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            handle: true,
            avatarUrl: true
          }
        }
      }
    });

    await prisma.creation.update({
      where: { id },
      data: { commentCount: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
};

// 6. Micro-Tip / Support Creator
exports.sendTip = async (req, res) => {
  try {
    const prisma = req.prisma;
    const senderId = req.user?.id || null;
    const { id } = req.params; // creationId
    const { amount, currency = 'INR', message, creatorId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid tip amount' });
    }

    let targetCreatorId = creatorId;
    if (!targetCreatorId && id) {
      const creation = await prisma.creation.findUnique({
        where: { id },
        select: { creatorId: true }
      });
      targetCreatorId = creation?.creatorId;
    }

    if (!targetCreatorId) {
      return res.status(400).json({ success: false, message: 'Recipient creator not found' });
    }

    const transactionRef = `TIP-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const tip = await prisma.creatorTip.create({
      data: {
        senderId,
        creatorId: targetCreatorId,
        creationId: id || null,
        amount: parseFloat(amount),
        currency,
        message: message || '',
        paymentStatus: 'SUCCESS',
        transactionRef
      }
    });

    res.status(201).json({
      success: true,
      message: `Tip of ${currency} ${amount} sent successfully!`,
      tip
    });
  } catch (error) {
    console.error('Error sending tip:', error);
    res.status(500).json({ success: false, message: 'Failed to process tip' });
  }
};

// 7. Creator Membership Tiers
exports.getCreatorTiers = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { creatorId } = req.params;

    const tiers = await prisma.creatorMembershipTier.findMany({
      where: { creatorId, isActive: true },
      orderBy: { price: 'asc' }
    });

    res.json({ success: true, tiers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tiers' });
  }
};

exports.createMembershipTier = async (req, res) => {
  try {
    const prisma = req.prisma;
    const creatorId = req.user.id;
    const { tierName, description, price, currency = 'INR', interval = 'MONTHLY', perks = [] } = req.body;

    const perksJson = Array.isArray(perks) ? JSON.stringify(perks) : (typeof perks === 'string' ? perks : '[]');

    const tier = await prisma.creatorMembershipTier.create({
      data: {
        creatorId,
        tierName,
        description,
        price: parseFloat(price),
        currency,
        interval,
        perks: perksJson
      }
    });

    res.status(201).json({ success: true, tier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create membership tier' });
  }
};
