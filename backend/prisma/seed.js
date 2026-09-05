const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Enterprise Master Blueprint data...');

  // 1. Root Administrator Accounts
  const defaultAdminPass = process.env.INITIAL_ADMIN_PASSWORD || 'AdminDefaultSecret123!';
  const rootPassword = await bcrypt.hash(defaultAdminPass, 12);

  const rootAdmin = await prisma.user.upsert({
    where: { email: 'root.operations@elvooriq.com' },
    update: {
      password: rootPassword,
      whatsapp: '+917665761616',
      status: 'ACTIVE',
      isEnabled: true,
      role: 'ADMIN',
      fullName: 'System Root Operator'
    },
    create: {
      fullName: 'System Root Operator',
      email: 'root.operations@elvooriq.com',
      password: rootPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      isEnabled: true,
      whatsapp: '+917665761616'
    }
  });
  console.log(`[SEED] Success! Root Admin account created/updated: ${rootAdmin.email}`);

  // Also ensure root.admin@elvooriq.com works for legacy tests
  await prisma.user.upsert({
    where: { email: 'root.admin@elvooriq.com' },
    update: {
      password: rootPassword,
      status: 'ACTIVE',
      isEnabled: true,
      role: 'ADMIN',
      fullName: 'Global Root Administrator'
    },
    create: {
      fullName: 'Global Root Administrator',
      email: 'root.admin@elvooriq.com',
      password: rootPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      isEnabled: true,
      whatsapp: '+917665761616'
    }
  });

  // 2. Certified Featured Creators Roster (suggestion.md 3.1)
  const certifiedCreators = [
    {
      name: 'Aishwarya Harishankar',
      handle: '@aishwaryaharishankar',
      followers: '1.3M',
      category: 'Lifestyle, Fashion & Luxury Brand Ambassador',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Jyoti Rai',
      handle: '@jyoti._.2k6',
      followers: '50K',
      category: 'Interactive Live Streaming & Esports',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Sunita Bera',
      handle: '@sunitabera9710',
      followers: '30K',
      category: 'Technical Gaming, Hardware Reviewer',
      imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Ayndrila',
      handle: '@andyycandyy',
      followers: '30K',
      category: 'High-Fashion & Beauty Content Creator',
      imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop'
    },
    {
      name: 'Soumili',
      handle: '@.diaries_of_mili.',
      followers: '50K',
      category: 'Travel Vlogging & Cultural Storytelling',
      imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop'
    }
  ];

  for (const creator of certifiedCreators) {
    const existing = await prisma.featuredCreator.findFirst({
      where: { handle: creator.handle }
    });

    if (existing) {
      await prisma.featuredCreator.update({
        where: { id: existing.id },
        data: creator
      });
    } else {
      await prisma.featuredCreator.create({
        data: creator
      });
    }
  }
  console.log(`[SEED] Success! ${certifiedCreators.length} certified creators seeded into database.`);

  // 3. Certified Creator Success Stories / Case Studies (suggestion.md 6.1 & 6.2)
  const caseStudiesData = [
    {
      creatorEmail: 'aishwarya@elvooriq.com',
      fullName: 'Aishwarya Harishankar',
      handle: '@aishwarishankar',
      nicheCategory: 'LIFESTYLE',
      durationMonths: 18,
      growthMultiplier: 44.0,
      pullQuote: "ELVOORIQ gave me the infrastructure I didn't know I needed. Within a year my revenue grew 44x and I quit my 9-to-5.",
      detailedNarrative: "Aishwarya Harishankar transformed from an overworked part-time lifestyle vlogger into a full-time digital powerhouse with 1.4M followers and ₹18,500/mo recurring revenue.",
      followersBefore: 8200,
      revenueBefore: 420.0,
      brandDealsBefore: 0,
      statusBefore: "Struggling Part-Time Creator",
      detailsBefore: "Posting 5x/week with low engagement, working 60 hours/week corporate job, zero brand monetization.",
      followersAfter: 1400000,
      revenueAfter: 18500.0,
      brandDealsAfter: 12,
      statusAfter: "Full-Time Multi-Platform Brand",
      detailsAfter: "Multi-platform media brand, 44x revenue growth, featured in Vogue India & Forbes Creator 30 Under 30."
    },
    {
      creatorEmail: 'sunita@elvooriq.com',
      fullName: 'Sunita Bera',
      handle: '@sunitabera_live',
      nicheCategory: 'GAMING & LIVE STREAMING',
      durationMonths: 12,
      growthMultiplier: 18.0,
      pullQuote: "The live ops and transcoding optimization doubled my watch time in 90 days. I went from playing games to owning a media network.",
      detailedNarrative: "Sunita Bera scaled into a tier-1 esports and simulcast creator with studio-grade transcoding and exclusive tech sponsorships.",
      followersBefore: 22000,
      revenueBefore: 850.0,
      brandDealsBefore: 1,
      statusBefore: "Solo Broadcast Streamer",
      detailsBefore: "Single platform streaming, frequent technical latency, inconsistent schedule, under-monetized viewer chat.",
      followersAfter: 890000,
      revenueAfter: 15200.0,
      brandDealsAfter: 9,
      statusAfter: "Tier-1 Esports & Gaming Icon",
      detailsAfter: "Simulcasting to 3 platforms, studio-grade transcoding, exclusive tech sponsorships with Razer and Asus ROG."
    },
    {
      creatorEmail: 'jyoti@elvooriq.com',
      fullName: 'Jyoti Roy',
      handle: '@jyotiroy_official',
      nicheCategory: 'FASHION & BEAUTY',
      durationMonths: 14,
      growthMultiplier: 25.0,
      pullQuote: "ELVOORIQ renegotiated my contracts and protected my licensing rights. They elevated me into rooms I never thought I could enter.",
      detailedNarrative: "Jyoti Roy graduated from low-margin gifted collabs to multi-year global ambassadorships with LVMH and Sephora.",
      followersBefore: 45000,
      revenueBefore: 1200.0,
      brandDealsBefore: 2,
      statusBefore: "Regional Micro-Influencer",
      detailsBefore: "Accepting low-margin gifted collabs, signing predatory contracts with IP forfeits, unoptimized visual aesthetics.",
      followersAfter: 1100000,
      revenueAfter: 28000.0,
      brandDealsAfter: 16,
      statusAfter: "Global Fashion Ambassadress",
      detailsAfter: "Signed multi-year ambassador contracts with LVMH and Sephora, launched proprietary ethical cosmetics line."
    }
  ];

  for (const cs of caseStudiesData) {
    // Upsert user for case study
    const user = await prisma.user.upsert({
      where: { email: cs.creatorEmail },
      update: {
        fullName: cs.fullName,
        platform: cs.nicheCategory,
        socialUrl: `https://instagram.com/${cs.handle.replace('@', '')}`,
        status: 'ACTIVE',
        isEnabled: true,
        role: 'CREATOR'
      },
      create: {
        email: cs.creatorEmail,
        fullName: cs.fullName,
        password: rootPassword,
        platform: cs.nicheCategory,
        socialUrl: `https://instagram.com/${cs.handle.replace('@', '')}`,
        role: 'CREATOR',
        status: 'ACTIVE',
        isEnabled: true
      }
    });

    await prisma.creatorCaseStudy.upsert({
      where: { userId: user.id },
      update: {
        nicheCategory: cs.nicheCategory,
        durationMonths: cs.durationMonths,
        growthMultiplier: cs.growthMultiplier,
        pullQuote: cs.pullQuote,
        detailedNarrative: cs.detailedNarrative,
        followersBefore: cs.followersBefore,
        revenueBefore: cs.revenueBefore,
        brandDealsBefore: cs.brandDealsBefore,
        statusBefore: cs.statusBefore,
        detailsBefore: cs.detailsBefore,
        followersAfter: cs.followersAfter,
        revenueAfter: cs.revenueAfter,
        brandDealsAfter: cs.brandDealsAfter,
        statusAfter: cs.statusAfter,
        detailsAfter: cs.detailsAfter
      },
      create: {
        userId: user.id,
        nicheCategory: cs.nicheCategory,
        durationMonths: cs.durationMonths,
        growthMultiplier: cs.growthMultiplier,
        pullQuote: cs.pullQuote,
        detailedNarrative: cs.detailedNarrative,
        followersBefore: cs.followersBefore,
        revenueBefore: cs.revenueBefore,
        brandDealsBefore: cs.brandDealsBefore,
        statusBefore: cs.statusBefore,
        detailsBefore: cs.detailsBefore,
        followersAfter: cs.followersAfter,
        revenueAfter: cs.revenueAfter,
        brandDealsAfter: cs.brandDealsAfter,
        statusAfter: cs.statusAfter,
        detailsAfter: cs.detailsAfter
      }
    });
  }
  console.log(`[SEED] Success! ${caseStudiesData.length} certified case studies seeded into database.`);

  console.log('✅ Enterprise Master Blueprint database seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
