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
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

exports.createPartnerRequest = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const partnerRequest = await prisma.partnerRequest.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'pending'
      }
    });

    // Real-time broadcast to all admin dashboards
    if (req.io) {
      req.io.to('admin_room').emit('admin:new_partner_request', partnerRequest);
    }

    res.status(201).json({
      success: true,
      requestId: partnerRequest.id,
      partnerRequest
    });
  } catch (error) {
    console.error('Error creating partner request:', error);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
};

exports.getPartnerRequests = async (req, res) => {
  try {
    const prisma = req.prisma;
    const requests = await prisma.partnerRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      partnerRequests: requests
    });
  } catch (error) {
    console.error('Error fetching partner requests:', error);
    res.status(500).json({ success: false, message: 'Server error fetching partner requests' });
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

    const partnerRequest = await prisma.partnerRequest.update({
      where: { id },
      data: { status }
    });

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
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

exports.getPartnerRequestById = async (req, res) => {
  try {
    const prisma = req.prisma;
    const { id } = req.params;

    const partnerRequest = await prisma.partnerRequest.findUnique({
      where: { id }
    });

    if (!partnerRequest) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    res.status(200).json({
      success: true,
      partnerRequest
    });
  } catch (error) {
    console.error('Error fetching partner request by id:', error);
    res.status(500).json({ success: false, message: 'Server error fetching request details' });
  }
};

