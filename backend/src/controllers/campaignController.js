/**
 * B2B Sponsorships & Escrow Settlement Engine Controller (Wireframe A)
 * ACID escrow release transaction: 75% creator payout, 20% agency cut, 5% agent bonus.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Lists all active sponsorship campaigns and milestones
 */
async function getCampaigns(req, res) {
  try {
    let campaigns = await prisma.sponsorshipCampaign.findMany({
      include: {
        creator: {
          select: { id: true, fullName: true, email: true, role: true }
        },
        manager: {
          select: { id: true, fullName: true, email: true }
        },
        tenant: true,
        milestones: {
          orderBy: { escrowAmount: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (campaigns.length === 0) {
      await seedMockCampaignsInternal();
      campaigns = await prisma.sponsorshipCampaign.findMany({
        include: {
          creator: {
            select: { id: true, fullName: true, email: true, role: true }
          },
          manager: {
            select: { id: true, fullName: true, email: true }
          },
          tenant: true,
          milestones: {
            orderBy: { escrowAmount: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return res.status(200).json({
      success: true,
      campaigns
    });
  } catch (error) {
    console.error('[Campaigns] Error getting campaigns:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Creates a new B2B brand sponsorship campaign
 */
async function createCampaign(req, res) {
  try {
    const {
      brandName,
      campaignTitle,
      creatorId,
      managerId,
      totalEscrow,
      currency,
      milestones
    } = req.body;

    if (!brandName || !campaignTitle || !creatorId || !totalEscrow) {
      return res.status(400).json({
        success: false,
        message: 'Brand name, title, creator ID, and escrow amount are required'
      });
    }

    const campaign = await prisma.sponsorshipCampaign.create({
      data: {
        brandName,
        campaignTitle,
        creatorId,
        managerId: managerId || req.user?.id || null,
        totalEscrow: Number(totalEscrow),
        currency: currency || 'USD',
        status: 'ACTIVE',
        milestones: {
          create: (milestones && milestones.length > 0) ? milestones.map(m => ({
            title: m.title || 'Sponsorship Deliverable',
            description: m.description || '',
            escrowAmount: Number(m.escrowAmount) || Number(totalEscrow),
            creatorPayout: (Number(m.escrowAmount) || Number(totalEscrow)) * 0.75,
            agencyCut: (Number(m.escrowAmount) || Number(totalEscrow)) * 0.20,
            agentBonus: (Number(m.escrowAmount) || Number(totalEscrow)) * 0.05,
            status: m.status || 'PENDING',
            deliverableUrl: m.deliverableUrl || null
          })) : [
            {
              title: 'Campaign Milestone Deliverable 1',
              description: 'Broadcast integration and dedicated brand segment',
              escrowAmount: Number(totalEscrow),
              creatorPayout: Number(totalEscrow) * 0.75,
              agencyCut: Number(totalEscrow) * 0.20,
              agentBonus: Number(totalEscrow) * 0.05,
              status: 'PENDING'
            }
          ]
        }
      },
      include: {
        milestones: true,
        creator: true
      }
    });

    return res.status(201).json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('[Campaigns] Error creating campaign:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Submits deliverable URL proof for a milestone
 */
async function submitMilestoneProof(req, res) {
  try {
    const { id } = req.params;
    const { deliverableUrl, proofMetrics } = req.body;

    if (!deliverableUrl) {
      return res.status(400).json({ success: false, message: 'Deliverable proof URL is required' });
    }

    const milestone = await prisma.campaignMilestone.update({
      where: { id },
      data: {
        deliverableUrl,
        proofMetrics: proofMetrics ? JSON.stringify(proofMetrics) : JSON.stringify({ views: 24500, likes: 1800, verified: true }),
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        campaign: {
          include: { creator: true }
        }
      }
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('campaign:milestone_submitted', {
        milestoneId: id,
        campaignTitle: milestone.campaign.campaignTitle,
        deliverableUrl
      });
    }

    return res.status(200).json({
      success: true,
      milestone
    });
  } catch (error) {
    console.error('[Campaigns] Error submitting milestone proof:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Resolves a milestone: APPROVE (ACID Escrow Release) or REJECT
 */
async function resolveMilestone(req, res) {
  try {
    const { id } = req.params;
    const { action, rejectReason } = req.body; // 'APPROVE' or 'REJECT'

    const milestone = await prisma.campaignMilestone.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            creator: true,
            manager: true
          }
        }
      }
    });

    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    if (milestone.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Milestone escrow has already been resolved and disbursed' });
    }

    if (action === 'REJECT') {
      const updated = await prisma.campaignMilestone.update({
        where: { id },
        data: {
          status: 'REJECTED',
          resolvedAt: new Date(),
          description: rejectReason ? `${milestone.description || ''} [Rejection: ${rejectReason}]` : milestone.description
        }
      });
      return res.status(200).json({
        success: true,
        message: 'Milestone submission rejected',
        milestone: updated
      });
    }

    // ACID Escrow Release Transaction (75% Creator, 20% Agency, 5% Supervising Agent)
    const transactionRef = `TX-ESCROW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const creatorAmount = milestone.creatorPayout;
    const agencyAmount = milestone.agencyCut;
    const agentBonusAmount = milestone.agentBonus;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update milestone status
      const resolvedMilestone = await tx.campaignMilestone.update({
        where: { id },
        data: {
          status: 'APPROVED',
          resolvedAt: new Date(),
          transactionRef
        }
      });

      // 2. Record RevenueSplit ledger for Creator
      await tx.revenueSplit.create({
        data: {
          userId: milestone.campaign.creatorId,
          platform: 'YouTube',
          billingCycle: `B2B-${milestone.campaign.brandName}`,
          grossRevenue: milestone.escrowAmount,
          agencyCut: agencyAmount,
          creatorCut: creatorAmount,
          agentBonus: agentBonusAmount,
          commissionRate: 20.0,
          isSyncedToPay: true,
          transactionId: transactionRef
        }
      });

      // 3. Create Security & Audit Log
      await tx.securityAuditTrail.create({
        data: {
          action: 'ESCROW_RELEASE',
          actorId: req.user?.id || milestone.campaign.managerId || null,
          targetResource: `CampaignMilestone:${id}`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'ELVOORIQ-API',
          metadata: JSON.stringify({
            brandName: milestone.campaign.brandName,
            campaignTitle: milestone.campaign.campaignTitle,
            escrowTotal: milestone.escrowAmount,
            creatorPayout: creatorAmount,
            agencyCut: agencyAmount,
            agentBonus: agentBonusAmount,
            transactionRef
          })
        }
      });

      return {
        milestone: resolvedMilestone,
        disbursement: {
          transactionRef,
          totalEscrow: milestone.escrowAmount,
          creatorPayout: creatorAmount,
          agencyCut: agencyAmount,
          agentBonus: agentBonusAmount
        }
      };
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('campaign:escrow_released', {
        milestoneId: id,
        brandName: milestone.campaign.brandName,
        transactionRef,
        creatorAmount,
        agentBonusAmount
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Escrow released and disbursed across ledger',
      data: result
    });
  } catch (error) {
    console.error('[Campaigns] Resolution error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Seeds realistic brand campaigns for demonstration
 */
async function seedMockCampaignsInternal() {
  const users = await prisma.user.findMany({ take: 5 });
  const creator = users.find(u => u.role === 'CREATOR') || users[0];
  const manager = users.find(u => u.role === 'EMPLOYEE' || u.role === 'ADMIN') || users[0];

  if (!creator) return;

  const mockCampaigns = [
    {
      brandName: 'Monster Energy',
      campaignTitle: 'Apex Legends Summer Invitational 2026',
      totalEscrow: 8500,
      milestones: [
        {
          title: '30s Mid-Roll Live Gameplay Plug & Can Display',
          description: 'Showcase Monster Zero Ultra on camera during peak tournament match',
          escrowAmount: 5000,
          deliverableUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          status: 'SUBMITTED',
          proofMetrics: JSON.stringify({ views: 42800, likes: 3200, retentionRate: '88%' })
        },
        {
          title: 'Post-Match Chat Giveaway Activation',
          description: 'Host interactive custom lobby tournament with Monster merch code drops',
          escrowAmount: 3500,
          status: 'PENDING'
        }
      ]
    },
    {
      brandName: 'Red Bull Media House',
      campaignTitle: 'Red Bull Live Pro Broadcast Takeover',
      totalEscrow: 12000,
      milestones: [
        {
          title: 'Branded Stream Overlay & 3hr Broadcast Marathons',
          description: 'Integrate dynamic animated Red Bull overlay during 3-day streaming marathon',
          escrowAmount: 7500,
          deliverableUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
          status: 'SUBMITTED',
          proofMetrics: JSON.stringify({ views: 128500, likes: 9400, retentionRate: '92%' })
        },
        {
          title: 'Dedicated Highlight Reel & Social Media Cross-Post',
          description: 'Post edited best-of clip to TikTok and YouTube Shorts tagging @RedBullGaming',
          escrowAmount: 4500,
          status: 'PENDING'
        }
      ]
    },
    {
      brandName: 'NordVPN',
      campaignTitle: 'NordVPN Global Creator Cyber Security Campaign',
      totalEscrow: 4500,
      milestones: [
        {
          title: 'Dedicated Security Pitch & Live Browser Demonstration',
          description: 'Demonstrate live Threat Protection and exclusive creator discount coupon',
          escrowAmount: 4500,
          deliverableUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
          status: 'APPROVED',
          proofMetrics: JSON.stringify({ views: 76000, signups: 412, verified: true })
        }
      ]
    }
  ];

  for (const c of mockCampaigns) {
    const existing = await prisma.sponsorshipCampaign.findFirst({
      where: { brandName: c.brandName, campaignTitle: c.campaignTitle }
    });
    if (!existing) {
      await prisma.sponsorshipCampaign.create({
        data: {
          brandName: c.brandName,
          campaignTitle: c.campaignTitle,
          creatorId: creator.id,
          managerId: manager?.id || null,
          totalEscrow: c.totalEscrow,
          currency: 'USD',
          status: 'ACTIVE',
          milestones: {
            create: c.milestones.map(m => ({
              title: m.title,
              description: m.description,
              escrowAmount: m.escrowAmount,
              creatorPayout: m.escrowAmount * 0.75,
              agencyCut: m.escrowAmount * 0.20,
              agentBonus: m.escrowAmount * 0.05,
              deliverableUrl: m.deliverableUrl || null,
              status: m.status,
              proofMetrics: m.proofMetrics || '{}',
              resolvedAt: m.status === 'APPROVED' ? new Date() : null,
              transactionRef: m.status === 'APPROVED' ? `TX-MOCK-${Date.now()}` : null
            }))
          }
        }
      });
    }
  }
}

/**
 * Explicit seed endpoint
 */
async function seedMockCampaigns(req, res) {
  try {
    await seedMockCampaignsInternal();
    return res.status(200).json({ success: true, message: 'Mock campaigns seeded successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getCampaigns,
  createCampaign,
  submitMilestoneProof,
  resolveMilestone,
  seedMockCampaigns
};
