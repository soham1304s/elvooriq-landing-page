const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Global SMS Telemetry Transmitter (v4.0)
 * @param {string} toPhone - Phone number with country code
 * @param {string} message - Clean SMS string body
 */
const sendSMS = async (toPhone, message) => {
  try {
    if (!toPhone) return false;
    const cleanPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone.trim()}`;

    if (!client) {
      console.log(`[DRY-RUN SMS SENDER] To: ${cleanPhone} | Message: "${message}"`);
      return true;
    }

    const res = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: cleanPhone
    });

    console.log(`[SMS SUCCESS] ID: ${res.sid} | Sent to: ${cleanPhone}`);
    return true;
  } catch (err) {
    console.error(`[SMS FAILURE] Failed to dispatch text payload to ${toPhone}:`, err.message);
    return false;
  }
};

module.exports = {
  sendSMS,
  notifyHROverdue: async (hrPhone, hrName, empName, taskTitle, dueDate) => {
    const formatted = new Date(dueDate).toLocaleString();
    const msg = `🚨 [ELVOORIQ Alert] Hi ${hrName}, Task "${taskTitle}" assigned to ${empName} has EXPIRED incomplete. Deadline was: ${formatted}.`;
    return await sendSMS(hrPhone, msg);
  },
  notifyHRDelivery: async (hrPhone, hrName, empName, taskTitle, dateCompleted) => {
    const formatted = new Date(dateCompleted).toLocaleString();
    const msg = `✅ [ELVOORIQ Success] Hi ${hrName}, Employee ${empName} has successfully completed task "${taskTitle}" ON-TIME at ${formatted}.`;
    return await sendSMS(hrPhone, msg);
  }
};
