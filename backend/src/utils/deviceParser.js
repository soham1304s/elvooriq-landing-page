/**
 * Utility to parse user-agent strings into device types, browser names, and operating systems.
 */

function parseUserAgent(userAgentString = '') {
  const ua = (userAgentString || '').toLowerCase();
  
  // 1. Determine Device Type
  let deviceType = 'DESKTOP';
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    deviceType = 'MOBILE';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
    deviceType = 'TABLET';
  }

  // 2. Determine Browser
  let browser = 'Unknown Browser';
  if (/edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/opr\/|opera\//i.test(ua)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/postman/i.test(ua)) {
    browser = 'Postman';
  } else if (/curl/i.test(ua)) {
    browser = 'cURL';
  }

  // 3. Determine Operating System
  let os = 'Unknown OS';
  if (/windows nt 10/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/windows nt/i.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  return { deviceType, browser, os };
}

module.exports = { parseUserAgent };
