const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (accountSid && authToken && accountSid !== 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
  client = twilio(accountSid, authToken);
}

/**
 * Sends an SMS, automatically falling back to database logs if Twilio is offline
 * @param {string} to - Recipient phone number (E.164 format)
 * @param {string} body - Message content
 */
const sendLiveSMS = async (to, body) => {
  try {
    if (!to) {
      console.warn('SMS skipped: Recipient number is blank.');
      return false;
    }

    const cleanTo = to.startsWith('+') ? to : `+${to.trim()}`;

    if (!client) {
      console.log(`[DRY-RUN / NO TWILIO KEY] To: ${cleanTo} | Msg: ${body}`);
      return true;
    }

    const message = await client.messages.create({
      body,
      from: twilioPhone,
      to: cleanTo
    });

    console.log(`[SMS SENT] SID: ${message.sid} to ${cleanTo}`);
    return true;

  } catch (error) {
    console.error(`[SMS RETRY-FAILED] Failed to send to ${to}. Error: ${error.message}`);
    
    // Fallback: Record failed notifications in the database for admin manual retry
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.securityEvents.create({
        data: {
          eventType: 'SMS_FAILED',
          ip: '127.0.0.1',
          userId: null,
          timestamp: new Date()
        }
      });
      await prisma.$disconnect();
    } catch (dbErr) {
      console.error('Could not log SMS failure event:', dbErr.message);
    }
    return false;
  }
};

module.exports = { sendLiveSMS };
