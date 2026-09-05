const crypto = require('crypto');

// Default secret key if not set in process.env
const ENCRYPTION_SECRET = process.env.FIELD_ENCRYPTION_KEY || 'elvooriq_enterprise_secret_encryption_key_v6_32bytes!!';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // 16 bytes for AES

// Derive 32-byte key using SHA-256
const KEY = crypto.createHash('sha256').update(String(ENCRYPTION_SECRET)).digest();

/**
 * Encrypts a plaintext string using AES-256-CBC with randomized IV
 * Output format: iv_hex:ciphertext_hex
 * @param {string} text
 * @returns {string}
 */
function encryptField(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(String(text), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('[cryptoHelper] Encryption error:', err);
    return text;
  }
}

/**
 * Decrypts an encrypted field string (iv_hex:ciphertext_hex)
 * @param {string} encryptedText
 * @returns {string}
 */
function decryptField(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
    return encryptedText;
  }
  try {
    const [ivHex, cipherHex] = encryptedText.split(':');
    if (!ivHex || !cipherHex) return encryptedText;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[cryptoHelper] Decryption error:', err);
    return encryptedText;
  }
}

/**
 * Computes a deterministic SHA-256 hash checksum for digital contract signatures
 * @param {string} content
 * @param {string} signer
 * @param {string|Date} timestamp
 * @returns {string} SHA-256 hex digest
 */
function generateSignatureChecksum(content, signer, timestamp) {
  const payload = `${content}__${signer}__${new Date(timestamp).toISOString()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

module.exports = {
  encryptField,
  decryptField,
  generateSignatureChecksum,
};
