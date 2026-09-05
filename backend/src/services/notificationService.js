// backend/src/services/notificationService.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;
if (accountSid && authToken) {
  try {
    twilioClient = twilio(accountSid, authToken);
  } catch (err) {
    console.warn('[TWILIO INIT WARNING] Failed to initialize Twilio client:', err.message);
  }
}

/**
 * Clean E.164 phone formatter
 * @param {string} phone 
 * @returns {string} Formatted number
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

/**
 * Base SMS Dispatch engine
 */
const sendSMS = async (toPhone, bodyText) => {
  try {
    const formattedTo = formatPhoneNumber(toPhone);
    if (!formattedTo) {
      console.warn("[SMS skipped] No recipient number provided.");
      return false;
    }

    if (!twilioClient) {
      console.log(`\n=============================================================`);
      console.log(`[DRY-RUN SMS DISPATCH]`);
      console.log(`To:      ${formattedTo}`);
      console.log(`Message: "${bodyText}"`);
      console.log(`=============================================================\n`);
      return true;
    }

    const response = await twilioClient.messages.create({
      body: bodyText,
      from: twilioPhone,
      to: formattedTo
    });

    console.log(`[SMS DISPATCHED] Sid: ${response.sid} | To: ${formattedTo}`);
    return true;
  } catch (err) {
    console.error(`[SMS FAILURE] Failed to send text to ${toPhone}:`, err.message);
    return false;
  }
};

/**
 * Triggers alert to HR when a task crosses its deadline incomplete
 */
const notifyHROfOverdue = async (hrPhone, hrName, employeeName, taskTitle, dueDate) => {
  const formattedDeadline = new Date(dueDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const message = `🚨 [ELVOORIQ Alert] Hi ${hrName || 'Admin'}, Task "${taskTitle}" assigned to ${employeeName} has EXPIRED without completion. Deadline was: ${formattedDeadline}.`;
  return await sendSMS(hrPhone, message);
};

/**
 * Triggers alert to HR when an employee delivers a task on-time
 */
const notifyHROfOnTimeDelivery = async (hrPhone, hrName, employeeName, taskTitle, deliveredTime) => {
  const formattedCompletion = new Date(deliveredTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const message = `✅ [ELVOORIQ Alert] Hi ${hrName || 'Admin'}, Employee ${employeeName} has completed task "${taskTitle}" ON-TIME at ${formattedCompletion}.`;
  return await sendSMS(hrPhone, message);
};

module.exports = {
  sendSMS,
  notifyHROfOverdue,
  notifyHROfOnTimeDelivery,
  formatPhoneNumber,
  // Backward compatibility aliases
  sendSMSAlert: sendSMS,
  notifyHROverdueTask: notifyHROfOverdue,
  notifyHROnTimeDelivery: notifyHROfOnTimeDelivery
};
