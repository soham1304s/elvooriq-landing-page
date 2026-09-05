/**
 * Automated High-Velocity Lead Engine & Workload-Aware Router
 * Analyzes platform reach metrics, computes lead scores (0-100),
 * and assigns candidates to active employees with lowest workload.
 */

function calculateLeadScore({ followers, platform, experience, bio }) {
  let score = 40; // baseline

  // Follower reach factor (up to +35)
  const fCount = Number(followers) || 0;
  if (fCount >= 500000) score += 35;
  else if (fCount >= 100000) score += 25;
  else if (fCount >= 25000) score += 18;
  else if (fCount >= 5000) score += 10;
  else if (fCount > 0) score += 5;

  // Platform multiplier (+15 for high monetization video/live streaming)
  const p = (platform || '').toLowerCase();
  if (p.includes('youtube') || p.includes('twitch') || p.includes('tiktok')) {
    score += 15;
  } else if (p.includes('instagram') || p.includes('kick')) {
    score += 10;
  } else if (p) {
    score += 5;
  }

  // Experience level bonus (+10)
  const exp = (experience || '').toLowerCase();
  if (exp.includes('partner') || exp.includes('full-time') || exp.includes('professional') || exp.includes('3+')) {
    score += 10;
  } else if (exp.includes('1-2') || exp.includes('growing')) {
    score += 5;
  }

  return Math.min(100, Math.max(15, score));
}

/**
 * Routes a new applicant to an active employee agent based on lowest capacity
 * @param {object} prisma - PrismaClient instance
 * @param {object} io - Socket.io instance
 * @param {object} leadData - { fullName, email, whatsapp, platform, socialUrl, followers, experience, bio }
 */
async function processAndRouteLead(prisma, io, leadData) {
  try {
    const score = calculateLeadScore(leadData);

    // 1. Fetch active employees
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: {
        assignedLeads: {
          where: { status: { notIn: ['SIGNED', 'REJECTED'] } }
        },
        workspaceMembers: {
          include: { workspace: true }
        }
      }
    });

    let assignedAgent = null;
    let assignedWorkspaceId = null;

    if (employees.length > 0) {
      // Sort ascending by open assigned lead count (workload-aware dispatch)
      employees.sort((a, b) => a.assignedLeads.length - b.assignedLeads.length);
      assignedAgent = employees[0];
      if (assignedAgent.workspaceMembers && assignedAgent.workspaceMembers.length > 0) {
        assignedWorkspaceId = assignedAgent.workspaceMembers[0].workspaceId;
      }
    } else {
      // Fallback to admin if no employee found
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin) assignedAgent = admin;
    }

    // 2. Persist Lead record
    const newLead = await prisma.lead.upsert({
      where: { email: leadData.email },
      update: {
        fullName: leadData.fullName,
        whatsapp: leadData.whatsapp,
        platform: leadData.platform,
        socialUrl: leadData.socialUrl || leadData.social_url,
        followers: Number(leadData.followers) || 0,
        score,
        agentId: assignedAgent ? assignedAgent.id : null,
        workspaceId: assignedWorkspaceId,
      },
      create: {
        fullName: leadData.fullName,
        email: leadData.email,
        whatsapp: leadData.whatsapp,
        platform: leadData.platform,
        socialUrl: leadData.socialUrl || leadData.social_url,
        followers: Number(leadData.followers) || 0,
        score,
        status: 'NEW',
        agentId: assignedAgent ? assignedAgent.id : null,
        workspaceId: assignedWorkspaceId,
        notes: `Auto-ingested via registration flow. Platform: ${leadData.platform || 'N/A'}. Score: ${score}/100.`,
      },
      include: {
        agent: { select: { id: true, fullName: true, email: true } },
        workspace: { select: { id: true, name: true } },
      }
    });

    // 3. Emit real-time telemetry and dispatch alerts
    if (io) {
      const payload = {
        leadId: newLead.id,
        agentId: assignedAgent ? assignedAgent.id : null,
        agentName: assignedAgent ? assignedAgent.fullName : 'Unassigned',
        fullName: newLead.fullName,
        platform: newLead.platform,
        score: newLead.score,
        status: newLead.status,
        workspaceId: assignedWorkspaceId,
      };

      // Broadcast to all connected clients & specific agent
      io.emit('lead:distributed', payload);

      // Audit telemetry directly into HR / Admin panel
      io.to('admin_room').emit('telemetry:log', {
        type: 'LEAD_ROUTED',
        message: `High-Velocity Router: "${newLead.fullName}" (Score: ${score}) assigned to ${assignedAgent ? assignedAgent.fullName : 'Queue'}`,
        timestamp: new Date().toISOString(),
        meta: payload
      });
    }

    return newLead;
  } catch (error) {
    console.error('Error in lead engine processing:', error);
    throw error;
  }
}

module.exports = {
  calculateLeadScore,
  processAndRouteLead,
};
