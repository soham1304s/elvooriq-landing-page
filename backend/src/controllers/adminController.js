const crypto = require('crypto');

// In-Memory fallback store for Vercel environments when PostgreSQL is temporarily unreachable
const inMemoryPartnerRequests = new Map();

exports.getAllUsers = async (req, res) => {
  try {
    const prisma = req.prisma;

    // Fetch all users, selecting only necessary fields to not send passwords
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        platform: true,
        whatsapp: true,
        role: true,
        createdAt: true
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
