const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
      isEnabled: true,
      password: true
    }
  });

  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    const isDefaultSecretMatch = await bcrypt.compare('AdminDefaultSecret123!', u.password);
    const isEnterpriseGateMatch = await bcrypt.compare('EnterpriseRosterGate2026!', u.password);
    console.log({
      email: u.email,
      role: u.role,
      status: u.status,
      isEnabled: u.isEnabled,
      matches_AdminDefaultSecret123: isDefaultSecretMatch,
      matches_EnterpriseRosterGate2026: isEnterpriseGateMatch
    });
  }
}

check()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
