const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCaseStudies = async (req, res) => {
  try {
    const caseStudies = await prisma.creatorCaseStudy.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            platform: true,
            socialUrl: true
          }
        }
      },
      orderBy: { growthMultiplier: 'desc' }
    });

    return res.status(200).json({
      success: true,
      caseStudies: caseStudies.map(cs => ({
        id: cs.id,
        userId: cs.userId,
        name: cs.user?.fullName || 'Certified Creator',
        handle: cs.user?.socialUrl ? `@${cs.user.socialUrl.split('/').pop()}` : '@elvooriq',
        nicheCategory: cs.nicheCategory,
        durationMonths: cs.durationMonths,
        journey: `${cs.durationMonths} Months Journey`,
        growthMultiplier: cs.growthMultiplier,
        badge: `${cs.growthMultiplier}x REVENUE EXPANSION`,
        pullQuote: cs.pullQuote,
        quote: cs.pullQuote,
        detailedNarrative: cs.detailedNarrative,
        before: {
          followers: cs.followersBefore > 1000 ? `${(cs.followersBefore / 1000).toFixed(1)}K` : `${cs.followersBefore}`,
          revenue: `₹${cs.revenueBefore.toLocaleString()}/mo`,
          brandDeals: `${cs.brandDealsBefore}`,
          status: cs.statusBefore,
          details: cs.detailsBefore
        },
        after: {
          followers: cs.followersAfter >= 1000000 ? `${(cs.followersAfter / 1000000).toFixed(1)}M` : `${(cs.followersAfter / 1000).toFixed(0)}K`,
          revenue: `₹${cs.revenueAfter.toLocaleString()}/mo`,
          brandDeals: `${cs.brandDealsAfter}`,
          status: cs.statusAfter,
          details: cs.detailsAfter
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch case studies', error: error.message });
  }
};

module.exports = { getCaseStudies };
