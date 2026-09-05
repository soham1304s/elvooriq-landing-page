const geoip = require('geoip-lite');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Enterprise GeoIP & Device Lock Gatekeeper (v4.0)
 * Evaluates login location and logs security anomalies.
 */
const geoIPLock = async (req, res, next) => {
  try {
    // Skip verification for static assets or public routing layers
    if (
      req.path.startsWith('/public') || 
      req.path === '/api/auth/login' || 
      req.path === '/api/auth/register' ||
      req.path.startsWith('/api/onboarding')
    ) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. Cryptographic bearer token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_local_testing_only');
    
    // Extract Client Network Coordinates
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = rawIp.split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    // Parse GeoIP
    const geo = (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost') ? null : geoip.lookup(clientIp);
    const country = geo ? geo.country : 'LOCAL';
    const city = geo ? geo.city : 'localhost';

    // Verify User Context In Database
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { securityEvents: { orderBy: { timestamp: 'desc' }, take: 1 } }
    });

    if (!dbUser || !dbUser.isEnabled || dbUser.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account status deactivated or pending approval.' });
    }

    // Evaluate Anomalies (e.g. Country drift on same session token)
    if (dbUser.securityEvents && dbUser.securityEvents.length > 0) {
      const lastSession = dbUser.securityEvents[0];
      if (lastSession.ip !== clientIp && lastSession.eventType === 'LOGIN' && country !== 'LOCAL') {
        const lastGeo = geoip.lookup(lastSession.ip);
        if (lastGeo && lastGeo.country && lastGeo.country !== country) {
          // Flag Anomaly Record in Database
          await prisma.securityAnomaly.create({
            data: {
              userId: dbUser.id,
              severity: 'CRITICAL',
              ipAddress: clientIp,
              deviceAgent: userAgent,
              locationInfo: `${city}, ${country}`,
              triggerReason: `Suspicious location transition. Session drifted from ${lastGeo.country} to ${country}.`
            }
          });

          return res.status(403).json({
            message: 'Cryptographic gate lock. Login location drift detected. Re-authentication required.'
          });
        }
      }
    }

    // Update Request Metadata
    req.user = dbUser;
    req.clientIP = clientIp;
    req.userAgent = userAgent;
    req.location = `${city}, ${country}`;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid cryptographic token.', error: err.message });
  }
};

module.exports = geoIPLock;
