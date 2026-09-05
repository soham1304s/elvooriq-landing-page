const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authorize = require('../middlewares/rbac');
const tenantIsolation = require('../middlewares/tenantIsolation');

/**
 * GET /api/franchise/tenants
 * Lists all regional guild franchises with streamer counts and operational status
 */
router.get('/tenants', authorize(['ADMIN', 'EMPLOYEE']), tenantIsolation, async (req, res) => {
  try {
    let tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            workspaces: true,
            campaigns: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (tenants.length === 0) {
      await seedMockTenantsInternal();
      tenants = await prisma.tenant.findMany({
        include: {
          _count: {
            select: {
              users: true,
              workspaces: true,
              campaigns: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
    }

    return res.status(200).json({
      success: true,
      tenants
    });
  } catch (error) {
    console.error('[Franchise] Error fetching tenants:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/franchise/tenants
 * Provisions a new regional guild franchise
 */
router.post('/tenants', authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, code, region, currency } = req.body;
    if (!name || !code || !region) {
      return res.status(400).json({ success: false, message: 'Name, code, and region are required' });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        code: code.toUpperCase(),
        region: region.toUpperCase(),
        currency: currency || 'USD',
        status: 'ACTIVE'
      }
    });

    return res.status(201).json({
      success: true,
      tenant
    });
  } catch (error) {
    console.error('[Franchise] Error creating tenant:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/franchise/tenants/:id/status
 * Locks or unlocks a franchise operational status
 */
router.patch('/tenants/:id/status', authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'

    const tenant = await prisma.tenant.update({
      where: { id },
      data: { status: status || 'ACTIVE' }
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('franchise:status_changed', { tenantId: id, status: tenant.status });
    }

    return res.status(200).json({
      success: true,
      tenant
    });
  } catch (error) {
    console.error('[Franchise] Error toggling status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Internal helper to seed initial regional guilds
 */
async function seedMockTenantsInternal() {
  const initialGuilds = [
    { name: 'ELVOORIQ Alpha (India Guild)', code: 'IN_GUILD', region: 'IN', currency: 'INR' },
    { name: 'ELVOORIQ Apex (Americas Guild)', code: 'US_GUILD', region: 'US', currency: 'USD' },
    { name: 'ELVOORIQ EuroGlow (European Guild)', code: 'EU_GUILD', region: 'EU', currency: 'EUR' },
    { name: 'ELVOORIQ Nexus (Asia-Pacific Guild)', code: 'APAC_GUILD', region: 'APAC', currency: 'SGD' }
  ];

  for (const g of initialGuilds) {
    const existing = await prisma.tenant.findUnique({ where: { code: g.code } });
    if (!existing) {
      await prisma.tenant.create({
        data: {
          name: g.name,
          code: g.code,
          region: g.region,
          currency: g.currency,
          status: 'ACTIVE'
        }
      });
    }
  }

  // Link existing workspaces and users to default guild if unassigned
  const alphaGuild = await prisma.tenant.findUnique({ where: { code: 'IN_GUILD' } });
  if (alphaGuild) {
    await prisma.workspace.updateMany({
      where: { tenantId: null },
      data: { tenantId: alphaGuild.id }
    });
    await prisma.user.updateMany({
      where: { tenantId: null },
      data: { tenantId: alphaGuild.id }
    });
  }
}

/**
 * POST /api/franchise/seed-mock
 */
router.post('/seed-mock', authorize(['ADMIN']), async (req, res) => {
  try {
    await seedMockTenantsInternal();
    return res.status(200).json({ success: true, message: 'Regional franchise guilds seeded successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
