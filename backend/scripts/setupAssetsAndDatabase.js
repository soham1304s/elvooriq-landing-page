const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const frontendDir = path.resolve(__dirname, '../../frontend');
const srcAssetsDir = path.join(frontendDir, 'assets');
const dstCreatorsDir = path.join(frontendDir, 'public', 'creators');

// Ensure destination exists
if (!fs.existsSync(dstCreatorsDir)) {
  fs.mkdirSync(dstCreatorsDir, { recursive: true });
}

// 1. Copy all files from frontend/assets to frontend/public/creators
const assetFiles = fs.readdirSync(srcAssetsDir);
console.log(`Found ${assetFiles.length} files in ${srcAssetsDir}`);

assetFiles.forEach(file => {
  const src = path.join(srcAssetsDir, file);
  const dst = path.join(dstCreatorsDir, file);
  fs.copyFileSync(src, dst);
});

// Standardized mapping
const fileMappings = {
  'Jhanvi-Bhatia.webp': 'jhanvi_bhatia.webp',
  'Komal-Pandey.webp': 'komal_pandey.webp',
  'Kritika-Khurana.webp': 'kritika_khurana.webp',
  'Kritika-Khuranaaa.webp': 'kritika_khurana_festive.webp',
  'Malvika-Sitlani.webp': 'malvika_sitlani.webp',
  'Mrunal-Panchal-.webp': 'mrunal_panchal.webp',
  'Sejal Kumar.webp': 'sejal_kumar.webp',
  'Shruti-Arjun-Anand.webp': 'shruti_arjun_anand.webp',
  'Somya-Gupta.webp': 'somya_gupta.webp',
  'aashika-bhatia.webp': 'aashika_bhatia.webp',
  'creator 1.webp': 'creator_1.webp',
  'creator 2.webp': 'creator_2.webp',
  'creator 3.webp': 'creator_3.webp',
  'creator 4.webp': 'creator_4.webp',
  'creator 5.webp': 'creator_5.webp',
  'creator 6.webp': 'creator_6.webp',
  'creator 7.webp': 'creator_7.webp',
};

Object.entries(fileMappings).forEach(([orig, webSafe]) => {
  const src = path.join(srcAssetsDir, orig);
  const dst = path.join(dstCreatorsDir, webSafe);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${orig} -> ${webSafe}`);
  }
});

// 2. Creator Roster data definition
const creatorRoster = [
  {
    name: 'Komal Pandey',
    handle: '@komalpandeyofficial',
    followers: '1.9M',
    category: 'Fashion & Styling',
    imageUrl: '/creators/komal_pandey.webp',
    objectPosition: 'center 15%'
  },
  {
    name: 'Kritika Khurana',
    handle: '@thatbohogirl',
    followers: '1.8M',
    category: 'Fashion & Travel',
    imageUrl: '/creators/kritika_khurana_festive.webp',
    objectPosition: 'center 20%'
  },
  {
    name: 'Aashika Bhatia',
    handle: '@aashikabhatia',
    followers: '5.7M',
    category: 'Lifestyle & Acting',
    imageUrl: '/creators/aashika_bhatia.webp',
    objectPosition: 'center 15%'
  },
  {
    name: 'Mrunal Panchal',
    handle: '@mrunu',
    followers: '4.8M',
    category: 'Beauty & Creative Art',
    imageUrl: '/creators/mrunal_panchal.webp',
    objectPosition: 'center 10%'
  },
  {
    name: 'Shruti Arjun Anand',
    handle: '@shrutiarjunanand',
    followers: '2.3M',
    category: 'Entertainment & Comedy',
    imageUrl: '/creators/shruti_arjun_anand.webp',
    objectPosition: 'center 20%'
  },
  {
    name: 'Jhanvi Bhatia',
    handle: '@jhanvibhatia',
    followers: '1.4M',
    category: 'Dance & Lifestyle',
    imageUrl: '/creators/jhanvi_bhatia.webp',
    objectPosition: 'center 20%'
  },
  {
    name: 'Malvika Sitlani',
    handle: '@malvikasitlaniofficial',
    followers: '1.2M',
    category: 'Beauty & Wellness',
    imageUrl: '/creators/malvika_sitlani.webp',
    objectPosition: 'center 15%'
  },
  {
    name: 'Sejal Kumar',
    handle: '@sejalkumar1195',
    followers: '1.1M',
    category: 'Music & Vlogging',
    imageUrl: '/creators/sejal_kumar.webp',
    objectPosition: 'center 20%'
  },
  {
    name: 'Somya Gupta',
    handle: '@thesastheory',
    followers: '950K',
    category: 'Aesthetic Fashion',
    imageUrl: '/creators/somya_gupta.webp',
    objectPosition: 'center 15%'
  },
  {
    name: 'Riya Sharma',
    handle: '@riyasharma.live',
    followers: '1.6M',
    category: 'Glamour & Lifestyle',
    imageUrl: '/creators/creator_1.webp',
    objectPosition: 'center 15%'
  },
  {
    name: 'Radhika Seth',
    handle: '@radhikasethh',
    followers: '1.5M',
    category: 'Luxury & Couture',
    imageUrl: '/creators/creator_2.webp',
    objectPosition: 'center 25%'
  },
  {
    name: 'Tanya Khanijow',
    handle: '@tanyakhanijow',
    followers: '1.3M',
    category: 'Travel & Culture',
    imageUrl: '/creators/creator_3.webp',
    objectPosition: 'center 20%'
  },
  {
    name: 'Shreya Jain',
    handle: '@shreyajain26',
    followers: '1.1M',
    category: 'Heritage & Style',
    imageUrl: '/creators/creator_4.webp',
    objectPosition: 'center 10%'
  },
  {
    name: 'Meghna Kaur',
    handle: '@shetroublemaker',
    followers: '1.4M',
    category: 'Urban Fashion',
    imageUrl: '/creators/creator_5.webp',
    objectPosition: 'center 20%'
  },
  {
    name: 'Roshni Chopra',
    handle: '@roshnichopra',
    followers: '920K',
    category: 'Wellness & Living',
    imageUrl: '/creators/creator_6.webp',
    objectPosition: 'center 10%'
  },
  {
    name: 'Diipa Khosla',
    handle: '@diipakhosla',
    followers: '2.1M',
    category: 'Global Fashion',
    imageUrl: '/creators/creator_7.webp',
    objectPosition: 'center 15%'
  },
  {
    name: 'Ananya Roy',
    handle: '@ananyaroy.official',
    followers: '880K',
    category: 'Bridal & Couture',
    imageUrl: '/creators/kritika_khurana.webp',
    objectPosition: 'center 20%'
  }
];

async function main() {
  console.log('Connecting to database...');
  // Delete existing featured creators
  const deleted = await prisma.featuredCreator.deleteMany({});
  console.log(`Deleted ${deleted.count} existing creators from FeaturedCreator table.`);

  // Insert all 17 new creators
  for (const c of creatorRoster) {
    const created = await prisma.featuredCreator.create({
      data: {
        name: c.name,
        handle: c.handle,
        followers: c.followers,
        category: c.category,
        imageUrl: c.imageUrl,
        isActive: true
      }
    });
    console.log(`Created creator: ${created.name} (${created.handle})`);
  }

  const total = await prisma.featuredCreator.count();
  console.log(`Total active creators in database: ${total}`);
}

main()
  .catch((e) => {
    console.error('Error updating database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
