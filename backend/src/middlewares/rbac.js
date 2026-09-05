const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT and enforce specific role permissions.
 * @param {Array<string>} allowedRoles - List of roles permitted to access the route.
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided. Authorization denied.' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      // Inject decoded user details into the request scope
      req.user = decoded;

      // Check if roles are restricted and the user holds a valid role
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          message: `Access Forbidden: Required role [${allowedRoles.join(' OR ')}] not held by user role [${req.user.role}].` 
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token verification failed. Access denied.', error: err.message });
    }
  };
};

module.exports = authorize;
