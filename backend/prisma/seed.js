const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PostgreSQL database seeding...');

  // 1. Featured Video Seed
  const videoCount = await prisma.featuredVideo.count();
  if (videoCount === 0) {
    await prisma.featuredVideo.create({
      data: {
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Elvooriq Platform Showcase',
        isActive: true,
      },
    });
    console.log('✅ Seeded initial Featured Video');
  }

  // 2. Featured Creators Seed
  const creatorCount = await prisma.featuredCreator.count();
  if (creatorCount === 0) {
    await prisma.featuredCreator.createMany({
      data: [
        {
          name: 'Alex Rivera',
          handle: '@alexrivera',
          followers: '1.2M',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          isActive: true,
        },
        {
          name: 'Sarah Chen',
          handle: '@sarahchen',
          followers: '850K',
          imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
          isActive: true,
        },
      ],
    });
    console.log('✅ Seeded initial Featured Creators');
  }

  // 3. Featured Talent Seed
  const talentCount = await prisma.featuredTalent.count();
  if (talentCount === 0) {
    await prisma.featuredTalent.createMany({
      data: [
        {
          name: 'Elena Rostova',
          handle: '@elena_r',
          category: 'Digital Art',
          platform: 'Instagram',
          followers: '500K',
          badges: JSON.stringify(['Top Creator', 'Rising Star']),
          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          isActive: true,
        },
        {
          name: 'Marcus Vance',
          handle: '@marcusvance',
          category: 'Tech & AI',
          platform: 'YouTube',
          followers: '2.1M',
          badges: JSON.stringify(['Verified', 'Tech Guru']),
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          isActive: true,
        },
      ],
    });
    console.log('✅ Seeded initial Featured Talent');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
