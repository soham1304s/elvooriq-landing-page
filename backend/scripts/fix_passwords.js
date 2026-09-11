const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function fixPasswords() {
  console.log('Synchronizing enterprise passwords...');
  const salt = await bcrypt.genSalt(12);
  const enterprisePassHash = await bcrypt.hash('EnterpriseRosterGate2026!', salt);

  const targets = [
    'root.operations@elvooriq.com',
    'root.admin@elvooriq.com',
    'hr@elvooriq.com',
    'hr.agent@elvooriq.com',
    'utsabsinha468@gmail.com'
  ];

  for (const email of targets) {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: enterprisePassHash,
          status: 'ACTIVE',
          isEnabled: true
        }
      });
      console.log(`Updated user ${email} (${user.role}): Password set to EnterpriseRosterGate2026!, status ACTIVE, isEnabled true`);
    } else {
      console.log(`User ${email} not found.`);
    }
  }

  console.log('Password synchronization complete.');
}

fixPasswords()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error:', e);
    prisma.$disconnect();
  });
