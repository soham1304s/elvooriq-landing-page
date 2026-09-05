const crypto = require('crypto');

// In-Memory fallback store for Vercel environments when PostgreSQL is temporarily unreachable
const inMemoryPartnerRequests = new Map();

const {
  generateMonthlyEmployeeQualityReport,
  generateAllEmployeesMonthlyReport
} = require('../services/analyticsService');

exports.getAllUsers = async (req, res) => {
  try {
    const prisma = req.prisma;

    // Fetch all users including activation status and employment details
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        platform: true,
        whatsapp: true,
        role: true,
        status: true,
        isEnabled: true,
        createdAt: true,
        employmentRecord: true,
        _count: {
          select: {
            assignedTasks: true,
            workLogs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users', error: error.message });
  }
};

exports.createPartnerRequest = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    let partnerRequest;

    try {
      partnerRequest = await prisma.partnerRequest.create({
        data: {
          name,
          email,
          subject,
          message,
          status: 'pending'
        }
      });
    } catch (dbError) {
      console.warn('PostgreSQL DB save failed on Vercel, using fallback resilient store:', dbError.message);
      const fallbackId = crypto.randomUUID ? crypto.randomUUID() : 'pr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      partnerRequest = {
        id: fallbackId,
        name,
        email,
        subject,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryPartnerRequests.set(fallbackId, partnerRequest);
    }

    // Real-time broadcast to all admin dashboards
    if (req.io) {
      req.io.to('admin_room').emit('admin:new_partner_request', partnerRequest);
    }

    return res.status(201).json({
      success: true,
      requestId: partnerRequest.id,
      partnerRequest
    });
  } catch (error) {
    console.error('Error creating partner request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing request',
      error: error.message
    });
  }
};

exports.getPartnerRequests = async (req, res) => {
  try {
    const prisma = req.prisma;
    let requests = [];

    try {
      requests = await prisma.partnerRequest.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (dbError) {
      console.warn('DB fetch failed, using fallback store:', dbError.message);
      requests = Array.from(inMemoryPartnerRequests.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Merge in-memory fallback items if any exist
    const memoryArray = Array.from(inMemoryPartnerRequests.values());
    const existingIds = new Set(requests.map(r => r.id));
    for (const memReq of memoryArray) {
      if (!existingIds.has(memReq.id)) {
        requests.push(memReq);
      }
    }

    res.status(200).json({
      success: true,
      partnerRequests: requests
    });
  } catch (error) {
    console.error('Error fetching partner requests:', error);
    res.status(500).json({ success: false, message: 'Server error fetching partner requests', error: error.message });
  }
};

exports.updatePartnerRequestStatus = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let partnerRequest;

    try {
      partnerRequest = await prisma.partnerRequest.update({
        where: { id },
        data: { status }
      });
    } catch (dbError) {
      console.warn('DB status update failed, checking in-memory store:', dbError.message);
      if (inMemoryPartnerRequests.has(id)) {
        partnerRequest = inMemoryPartnerRequests.get(id);
        partnerRequest.status = status;
        partnerRequest.updatedAt = new Date().toISOString();
        inMemoryPartnerRequests.set(id, partnerRequest);
      } else {
        partnerRequest = { id, status, updatedAt: new Date().toISOString() };
      }
    }

    // Real-time notification update to client listening in the request room
    if (req.io) {
      req.io.to('partner_request_' + id).emit('partner_request:status_update', {
        id,
        status
      });
      // Also notify admins of status update to stay in sync
      req.io.to('admin_room').emit('admin:partner_request_updated', partnerRequest);
    }

    res.status(200).json({
      success: true,
      partnerRequest
    });
  } catch (error) {
    console.error('Error updating partner request status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status', error: error.message });
  }
};

exports.getPartnerRequestById = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    let partnerRequest = null;

    try {
      partnerRequest = await prisma.partnerRequest.findUnique({
        where: { id }
      });
    } catch (dbError) {
      console.warn('DB fetch by ID failed, checking in-memory store:', dbError.message);
      partnerRequest = inMemoryPartnerRequests.get(id) || null;
    }

    if (!partnerRequest && inMemoryPartnerRequests.has(id)) {
      partnerRequest = inMemoryPartnerRequests.get(id);
    }

    if (!partnerRequest) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    res.status(200).json({
      success: true,
      partnerRequest
    });
  } catch (error) {
    console.error('Error fetching partner request by id:', error);
    res.status(500).json({ success: false, message: 'Server error fetching request details', error: error.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;
    const { action, status, isEnabled } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'The requested User profile could not be located.' });
    }

    let updatedStatus = status !== undefined ? status : targetUser.status;
    let updatedEnabled = isEnabled !== undefined ? Boolean(isEnabled) : targetUser.isEnabled;

    if (action === 'approve') {
      updatedStatus = 'ACTIVE';
      updatedEnabled = true;
    } else if (action === 'reject') {
      updatedStatus = 'INACTIVE';
      updatedEnabled = false;
    } else if (action === 'suspend') {
      updatedStatus = 'SUSPENDED';
      updatedEnabled = false;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: updatedStatus,
        isEnabled: updatedEnabled
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        isEnabled: true,
        updatedAt: true
      }
    });

    const userPayload = {
      id: updatedUser.id,
      name: updatedUser.fullName,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      isEnabled: updatedUser.isEnabled,
      updatedAt: updatedUser.updatedAt
    };

    if (req.io) {
      req.io.to('admin_room').emit('admin:user_status_changed', userPayload);
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'USER_ACTIVATION_CHANGE',
        message: `User ${updatedUser.fullName} status updated to [${updatedUser.status}] (Enabled: ${updatedUser.isEnabled})`,
        timestamp: new Date().toISOString(),
        meta: { userId: updatedUser.id, status: updatedUser.status, isEnabled: updatedUser.isEnabled }
      });
    }

    res.status(200).json({
      success: true,
      message: `User account status successfully modified to [${updatedUser.status}].`,
      user: userPayload
    });
  } catch (error) {
    console.error('Error activating/updating user:', error);
    res.status(500).json({ success: false, message: 'Failed to execute manual activation override.', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'The requested User profile could not be located.' });
    }

    // Protection: Prevent deleting Root Administrator
    if (targetUser.email === 'root.admin@elvooriq.com') {
      return res.status(403).json({ success: false, message: 'Security Violation: Root Administrator profile cannot be deleted.' });
    }

    // Protection: Prevent admin from deleting their own active session
    if (req.user && req.user.id === id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator profile.' });
    }

    // Cascade delete relations in a transaction to prevent FK constraint violations
    await prisma.$transaction(async (tx) => {
      // 1. Tasks & work logs
      await tx.dailyWorkLog.deleteMany({ where: { userId: id } });
      await tx.task.deleteMany({ where: { OR: [{ assigneeId: id }, { creatorId: id }] } });

      // 2. Financial tracking & employment
      await tx.payrollDisbursement.deleteMany({ where: { userId: id } });
      await tx.payrollLedger.deleteMany({ where: { userId: id } });
      await tx.revenueSplit.deleteMany({ where: { userId: id } });
      await tx.employmentRecord.deleteMany({ where: { userId: id } });

      // 3. Workspace memberships
      await tx.workspaceMember.deleteMany({ where: { userId: id } });

      // 4. Leads & CRM
      await tx.leadInteraction.deleteMany({ where: { agentId: id } });
      await tx.auditionTape.deleteMany({ where: { reviewerId: id } });
      await tx.lead.deleteMany({ where: { agentId: id } });

      // 5. Compliance & Onboarding
      await tx.onboardingDocument.deleteMany({ where: { userId: id } });
      await tx.offerLetter.deleteMany({ where: { OR: [{ candidateId: id }, { hrId: id }] } });

      // 6. Contracts & Sponsorships
      await tx.digitalSignature.deleteMany({ where: { signerId: id } });
      await tx.legalContract.deleteMany({ where: { OR: [{ signeeId: id }, { preparerId: id }] } });
      await tx.campaignMilestone.deleteMany({ where: { campaign: { creatorId: id } } });
      await tx.sponsorshipCampaign.deleteMany({ where: { OR: [{ creatorId: id }, { managerId: id }] } });
      await tx.channelAudit.deleteMany({ where: { OR: [{ creatorId: id }, { agentId: id }] } });

      // 7. Streaming & Telemetry
      await tx.streamLog.deleteMany({ where: { creatorId: id } });
      await tx.liveAnalytics.deleteMany({ where: { session: { userId: id } } });
      await tx.liveRecording.deleteMany({ where: { session: { userId: id } } });
      await tx.liveEvent.deleteMany({ where: { session: { userId: id } } });
      await tx.liveSession.deleteMany({ where: { userId: id } });
      await tx.scheduledStream.deleteMany({ where: { userId: id } });
      await tx.creatorStreamingSetting.deleteMany({ where: { userId: id } });
      await tx.youTubeConnection.deleteMany({ where: { userId: id } });
      await tx.securityAnomaly.deleteMany({ where: { userId: id } });
      await tx.securityEvents.deleteMany({ where: { userId: id } });

      // 8. Delete user record
      await tx.user.delete({ where: { id } });
    });

    if (req.io) {
      req.io.to('admin_room').emit('admin:user_deleted', { id, email: targetUser.email });
      req.io.to('admin_room').emit('telemetry:log', {
        type: 'USER_DELETED',
        message: `Profile deleted: ${targetUser.fullName || targetUser.name || targetUser.email}`,
        timestamp: new Date().toISOString(),
        meta: { userId: id, email: targetUser.email }
      });
    }

    return res.status(200).json({
      success: true,
      message: `User profile ${targetUser.fullName || targetUser.email} has been permanently deleted.`
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user profile', error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month, employeeId } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month !== undefined ? parseInt(month) : new Date().getMonth();
    const AnalyticsEngine = require('../services/analyticsEngine');

    if (employeeId) {
      const report = await AnalyticsEngine.compileMonthlyReport(employeeId, targetYear, targetMonth);
      return res.status(200).json({ success: true, report });
    } else {
      const reports = await AnalyticsEngine.compileAllReports(targetYear, targetMonth);
      return res.status(200).json({ success: true, reports });
    }
  } catch (error) {
    console.error('Error generating monthly reports:', error);
    res.status(500).json({ success: false, message: 'Failed to generate monthly quality reports', error: error.message });
  }
};
