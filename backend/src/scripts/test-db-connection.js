require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  console.log('🔍 Testing PostgreSQL Database connection via Prisma...');
  console.log(`📌 Target DATABASE_URL host: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] || 'Configured' : 'NOT SET'}`);

  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL Database via Prisma!');
    
    // Quick test query
    const userCount = await prisma.user.count();
    console.log(`📊 Current Users Count in DB: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    console.warn('\n💡 Troubleshooting Checklist:');
    console.warn('1. Ensure your PostgreSQL server is running or cloud URL (Supabase/Neon/Render) is valid.');
    console.warn('2. Check DATABASE_URL in backend/.env');
    console.warn('3. Run `npx prisma db push` once your PostgreSQL instance is reachable to create tables.\n');
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkDatabaseConnection();
}

module.exports = checkDatabaseConnection;
