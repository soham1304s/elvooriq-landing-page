const crypto = require('crypto');

/**
 * Twitch/Platform-style Signature Verification Middleware to guarantee webhook authenticity.
 * Checks HMAC-SHA256 signature using WEBHOOK_SECRET_KEY.
 */
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  const timestamp = req.headers['x-hub-signature-timestamp'];

  const secret = process.env.WEBHOOK_SECRET_KEY || 'elvooriq_webhook_secret_key_v5';

  if (!signature || !timestamp) {
    return res.status(401).json({ success: false, message: "Missing cryptographic authentication signatures." });
  }

  try {
    const message = timestamp + JSON.stringify(req.body);
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      next();
    } else {
      return res.status(403).json({ success: false, message: "Cryptographic signature check failed." });
    }
  } catch (err) {
    return res.status(403).json({ success: false, message: "Signature verification error: " + err.message });
  }
};

module.exports = verifyWebhookSignature;
