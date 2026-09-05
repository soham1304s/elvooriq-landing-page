/**
 * Multi-Tenant Franchising & Guild Isolation Middleware (v6.0)
 * Enforces regional sub-agency data scoping while allowing Root Operations Group global oversight.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function tenantIsolationMiddleware(req, res, next) {
  // 1. Root Admin has global oversight bypass
  if (req.user && req.user.role === 'ADMIN' && !req.headers['x-tenant-id']) {
    req.isRootAdmin = true;
    req.tenantId = null; // Unrestricted
    return next();
  }

  // 2. Identify target tenant from header, query, or user's assigned tenant
  const explicitTenantId = req.headers['x-tenant-id'] || req.query.tenantId;
  const userTenantId = req.user?.tenantId;

  req.tenantId = explicitTenantId || userTenantId || null;
  req.isRootAdmin = req.user?.role === 'ADMIN';

  next();
}

module.exports = tenantIsolationMiddleware;
