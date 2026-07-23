require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function test() {
  try {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const newSession = await prisma.authenticationSession.create({
      data: {
        sessionId,
        flowType: 'login',
        currentStep: 'email',
      }
    });
    console.log("Success:", newSession);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
