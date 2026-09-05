const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MAX_LEAD_CAPACITY = 10; // Maximum allowed active leads per agent
const REDISTRIBUTION_WINDOW_MINS = 180; // 3 Hours redistribution timer

class LeadRouter {
  /**
   * Processes an incoming creator application
   * @param {object} rawLeadData - Lead metadata captured by RegisterEngine
   */
  static async routeIncomingLead(rawLeadData) {
    try {
      const { fullName, email, whatsapp, platform, socialUrl, followers } = rawLeadData;

      // 1. Compute Priority Score (0-100) based on reach
      const count = parseInt(followers) || 0;
      let score = 10; // Baseline score
      if (count > 100000) score = 95;
      else if (count > 50000) score = 80;
      else if (count > 10000) score = 60;
      else if (count > 5000) score = 40;

      // Create primary Lead record
      const lead = await prisma.lead.create({
        data: {
          fullName: fullName || 'Anonymous Creator',
          email,
          whatsapp,
          platform,
          socialUrl,
          followers: count,
          score,
          status: 'NEW'
        }
      });

      // 2. Query Active & Enabled Agents ordered by workload
      const agents = await prisma.user.findMany({
        where: { role: 'EMPLOYEE', status: 'ACTIVE', isEnabled: true },
        include: { assignedLeads: { where: { status: { in: ['NEW', 'CONTACTED', 'INTERVIEWED'] } } } }
      });

      if (agents.length === 0) {
        return await this.enqueueLead(lead.id, 'NO_ACTIVE_AGENTS');
      }

      // Find the agent with the lowest active workload
      const sortedAgents = agents.sort((a, b) => a.assignedLeads.length - b.assignedLeads.length);
      const targetAgent = sortedAgents[0];

      if (targetAgent.assignedLeads.length >= MAX_LEAD_CAPACITY) {
        return await this.enqueueLead(lead.id, 'ALL_AGENTS_OVERLOADED');
      }

      // Assign lead directly
      const assignedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: { agentId: targetAgent.id, status: 'CONTACTED' }
      });

      console.log(`[LEAD_ROUTER] Directly assigned Lead ${lead.fullName} to Agent ${targetAgent.fullName || targetAgent.name}`);
      return { status: 'ROUTED', lead: assignedLead, agentId: targetAgent.id };

    } catch (err) {
      console.error('[LEAD_ROUTER_ERROR] Inward routing pipeline failed:', err.message);
      throw err;
    }
  }

  static async enqueueLead(leadId, reason) {
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + REDISTRIBUTION_WINDOW_MINS);

    await prisma.$transaction([
      prisma.lead.update({ where: { id: leadId }, data: { status: 'QUEUED' } }),
      prisma.leadQueue.create({
        data: {
          leadId,
          enqueueReason: reason,
          expireAt
        }
      })
    ]);

    console.warn(`[LEAD_ROUTER] Lead ID ${leadId} has been enqueued in LeadQueue. Reason: ${reason}`);
    return { status: 'QUEUED', leadId, reason, expireAt };
  }
}

module.exports = LeadRouter;
