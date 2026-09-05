const { processAndRouteLead } = require('../modules/leadEngine');

exports.getLeads = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { status, agentId, minScore } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    const where = {};
    if (userRole === 'EMPLOYEE') {
      // Employees default to their own assigned leads unless explicitly filtering
      where.agentId = agentId || userId;
    } else if (agentId) {
      where.agentId = agentId;
    }

    if (status) where.status = status;
    if (minScore) where.score = { gte: parseInt(minScore) };

    const leads = await prisma.lead.findMany({
      where,
      include: {
        agent: { select: { id: true, fullName: true, email: true } },
        workspace: { select: { id: true, name: true } },
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ success: true, leads });
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
};

exports.createLead = async (req, res) => {
  try {
    const prisma = req.prisma;
    const io = req.io;
    const { fullName, email, whatsapp, platform, socialUrl, followers, experience, bio } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required' });
    }

    const lead = await processAndRouteLead(prisma, io, {
      fullName,
      email,
      whatsapp,
      platform,
      socialUrl,
      followers,
      experience,
      bio
    });

    res.status(201).json({ success: true, lead });
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ success: false, message: 'Failed to process and route lead' });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;
    const { status, agentId, notes, workspaceId } = req.body;

    const data = {};
    if (status) data.status = status;
    if (agentId !== undefined) data.agentId = agentId || null;
    if (notes !== undefined) data.notes = notes;
    if (workspaceId !== undefined) data.workspaceId = workspaceId || null;

    const updated = await prisma.lead.update({
      where: { id },
      data,
      include: {
        agent: { select: { id: true, fullName: true, email: true } },
        workspace: { select: { id: true, name: true } },
      }
    });

    if (req.io) {
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'LEAD_UPDATED',
        message: `Lead "${updated.fullName}" updated to status ${updated.status}${updated.agent ? ` (Assigned: ${updated.agent.fullName})` : ''}`,
        timestamp: new Date().toISOString(),
        meta: { leadId: updated.id, status: updated.status }
      });
    }

    res.json({ success: true, lead: updated });
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ success: false, message: 'Failed to update lead' });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    await prisma.lead.delete({ where: { id } });
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ success: false, message: 'Failed to delete lead' });
  }
};

// =========================================================================
// High-Velocity Lead Queue Management (v4.0 Wireframe D)
// =========================================================================

exports.getLeadQueue = async (req, res) => {
  try {
    const prisma = req.prisma;

    // Fetch active agents and compute current capacity
    const agents = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', status: 'ACTIVE', isEnabled: true },
      include: {
        assignedLeads: { where: { status: { in: ['NEW', 'CONTACTED', 'INTERVIEWED'] } } }
      }
    });

    const totalActiveLeads = agents.reduce((acc, a) => acc + a.assignedLeads.length, 0);
    const maxGlobalCapacity = agents.length * 10;
    const isCapacityExceeded = agents.length === 0 || agents.every(a => a.assignedLeads.length >= 10);

    // Fetch enqueued leads
    const queuedItems = await prisma.leadQueue.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Enrich with lead profiles
    const enrichedQueue = await Promise.all(
      queuedItems.map(async (item) => {
        const lead = await prisma.lead.findUnique({ where: { id: item.leadId } });
        const now = new Date();
        const diffMs = new Date(item.expireAt) - now;
        const remainingMinutes = Math.max(0, Math.round(diffMs / 60000));
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;
        const holdTimeStr = `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;

        return {
          id: item.id,
          queueId: `Q-${item.id.slice(0, 4).toUpperCase()}`,
          leadId: item.leadId,
          enqueueReason: item.enqueueReason,
          expireAt: item.expireAt,
          holdTimeRemaining: holdTimeStr,
          createdAt: item.createdAt,
          lead: lead || {
            fullName: 'Unknown Creator',
            platform: 'YouTube',
            followers: 0,
            score: 50,
            socialUrl: ''
          }
        };
      })
    );

    res.json({
      success: true,
      queue: enrichedQueue,
      routerStatus: {
        isCapacityExceeded,
        state: isCapacityExceeded ? 'ACTIVE - AGENTS AT CAPACITY' : 'ACTIVE - BALANCED WORKLOAD',
        activeQueueCount: queuedItems.length,
        activeAgentsCount: agents.length,
        totalActiveLeads,
        maxGlobalCapacity
      }
    });
  } catch (err) {
    console.error('Error fetching lead queue:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve lead queue telemetry' });
  }
};

exports.forceRedistribute = async (req, res) => {
  try {
    const prisma = req.prisma;

    // Fetch all active agents
    const agents = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', status: 'ACTIVE', isEnabled: true },
      include: {
        assignedLeads: { where: { status: { in: ['NEW', 'CONTACTED', 'INTERVIEWED'] } } }
      }
    });

    const queuedItems = await prisma.leadQueue.findMany({
      orderBy: { createdAt: 'asc' }
    });

    let redistributedCount = 0;

    for (const item of queuedItems) {
      // Sort agents by workload ascending
      const availableAgent = agents
        .filter(a => a.assignedLeads.length < 10)
        .sort((a, b) => a.assignedLeads.length - b.assignedLeads.length)[0];

      if (availableAgent) {
        // Assign lead
        await prisma.$transaction([
          prisma.lead.update({
            where: { id: item.leadId },
            data: { agentId: availableAgent.id, status: 'CONTACTED' }
          }),
          prisma.leadQueue.delete({ where: { id: item.id } })
        ]);

        availableAgent.assignedLeads.push({ id: item.leadId });
        redistributedCount++;
      }
    }

    const remainingInQueue = await prisma.leadQueue.count();

    res.json({
      success: true,
      message: `Redistributed ${redistributedCount} lead(s) to active staff.`,
      redistributedCount,
      remainingInQueue
    });
  } catch (err) {
    console.error('Error during forced redistribution:', err);
    res.status(500).json({ success: false, message: 'Force redistribution failed', error: err.message });
  }
};

exports.rerouteOffline = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, message: 'leadId is required' });
    }

    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: { status: 'ARCHIVED', notes: 'Rerouted to offline nurturing queue' }
      }),
      prisma.leadQueue.deleteMany({
        where: { leadId }
      })
    ]);

    res.json({
      success: true,
      message: 'Lead rerouted to offline nurturing queue successfully.'
    });
  } catch (err) {
    console.error('Error rerouting lead offline:', err);
    res.status(500).json({ success: false, message: 'Failed to reroute lead offline', error: err.message });
  }
};

