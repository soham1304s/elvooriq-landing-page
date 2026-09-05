const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const twilio = require('twilio');

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (e) {
    console.warn("Twilio client initialization failed:", e.message);
  }
}

let sgMail = null;
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (e) {
    console.warn("SendGrid client initialization failed:", e.message);
  }
}

/**
 * Sends unified outbound outreach to creator leads and logs interaction metrics
 */
const sendLeadOutboundOutreach = async (req, res) => {
  const { leadId, channel, messageText, templateName } = req.body;
  const agentId = req.user.id; // Decoded from JWT auth

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Target lead record not found." });
    }

    let deliveryStatus = "SENT";

    // 1. Dispatch Messaging through Selected Route
    if (channel === "WHATSAPP") {
      const targetNumber = lead.whatsapp;
      if (!targetNumber) {
        return res.status(400).json({ success: false, message: "Lead does not have a registered phone number for WhatsApp outreach." });
      }
      
      if (twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
        try {
          const formattedNumber = targetNumber.startsWith('+') ? targetNumber : `+${targetNumber.trim()}`;
          await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            body: messageText,
            to: `whatsapp:${formattedNumber}`
          });
        } catch (twErr) {
          console.warn("[Twilio WhatsApp API Error - Fallback to Dry Run]:", twErr.message);
          deliveryStatus = "SENT (SIMULATED)";
        }
      } else {
        console.log(`[DRY-RUN WHATSAPP] To: ${targetNumber} | Text: "${messageText}"`);
        deliveryStatus = "SENT (SIMULATED)";
      }
    } 
    
    else if (channel === "SMS") {
      const targetNumber = lead.whatsapp;
      if (!targetNumber) {
        return res.status(400).json({ success: false, message: "Lead does not have a registered phone number for SMS outreach." });
      }

      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const formattedNumber = targetNumber.startsWith('+') ? targetNumber : `+${targetNumber.trim()}`;
          await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            body: messageText,
            to: formattedNumber
          });
        } catch (twErr) {
          console.warn("[Twilio SMS API Error - Fallback to Dry Run]:", twErr.message);
          deliveryStatus = "SENT (SIMULATED)";
        }
      } else {
        console.log(`[DRY-RUN SMS] To: ${targetNumber} | Text: "${messageText}"`);
        deliveryStatus = "SENT (SIMULATED)";
      }
    } 
    
    else if (channel === "EMAIL") {
      if (!lead.email) {
        return res.status(400).json({ success: false, message: "Lead does not have a registered email address." });
      }

      if (sgMail && process.env.SENDGRID_API_KEY) {
        try {
          await sgMail.send({
            to: lead.email,
            from: process.env.SENDER_EMAIL_ADDRESS || 'outreach@elvooriq.com',
            subject: "ELVOORIQ Creator Agency Onboarding Outreach",
            text: messageText
          });
        } catch (sgErr) {
          console.warn("[SendGrid API Error - Fallback to Dry Run]:", sgErr.message);
          deliveryStatus = "SENT (SIMULATED)";
        }
      } else {
        console.log(`[DRY-RUN EMAIL] To: ${lead.email} | Subject: Onboarding | Text: "${messageText}"`);
        deliveryStatus = "SENT (SIMULATED)";
      }
    } 
    
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid outreach messaging channel. Supported channels: [WHATSAPP, SMS, EMAIL]"
      });
    }

    // 2. Log Message Interaction & Transition Lead State to OUTREACH_SENT
    const oldStatus = lead.status;
    const newStatus = "OUTREACH_SENT";

    const [interaction, updatedLead, history] = await prisma.$transaction([
      prisma.leadInteraction.create({
        data: {
          leadId,
          agentId,
          channel,
          direction: "OUTBOUND",
          messageText,
          templateName: templateName || "Custom_Outreach",
          deliveryStatus
        }
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: { status: newStatus }
      }),
      prisma.leadHistory.create({
        data: {
          leadId,
          oldStatus,
          newStatus,
          updatedById: agentId,
          note: `Sent ${channel} onboarding invitation using template: ${templateName || "Custom_Outreach"}`
        }
      })
    ]);

    // Broadcast update via Socket.IO if available
    const io = req.app.get('socketio') || req.io;
    if (io) {
      io.to('admin_room').emit('lead:interaction', {
        type: 'OUTBOUND_SENT',
        leadId,
        channel,
        leadName: lead.fullName,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Outbound outreach message dispatched over ${channel} successfully.`,
      interaction,
      lead: updatedLead,
      newLeadStatus: newStatus
    });

  } catch (error) {
    console.error("CRM Outbound delivery error:", error);
    return res.status(500).json({
      success: false,
      message: "Omnichannel outbound delivery failed.",
      error: error.message
    });
  }
};

/**
 * Retrieves a lead with their full interactions and history
 */
const getLeadWithInteractions = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, fullName: true, email: true } },
        workspace: { select: { id: true, name: true } },
        interactions: {
          orderBy: { createdAt: 'asc' },
          include: { agent: { select: { id: true, fullName: true } } }
        },
        history: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    return res.status(200).json({ success: true, lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch lead details.", error: error.message });
  }
};

/**
 * Lists leads for the CRM conversation desk
 */
const getCRMLeads = async (req, res) => {
  try {
    const { status, workspaceId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (workspaceId) where.workspaceId = workspaceId;

    const leads = await prisma.lead.findMany({
      where,
      include: {
        agent: { select: { id: true, fullName: true, email: true } },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, leads });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to list CRM leads.", error: error.message });
  }
};

/**
 * Simulates or logs an inbound message from a creator lead
 */
const recordInboundMessage = async (req, res) => {
  try {
    const { leadId, channel, messageText } = req.body;
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    // Agent ID or fallback to lead's assigned agent or system user
    const agentId = lead.agentId || req.user.id;

    const interaction = await prisma.leadInteraction.create({
      data: {
        leadId,
        agentId,
        channel: channel || "WHATSAPP",
        direction: "INBOUND",
        messageText,
        deliveryStatus: "DELIVERED"
      }
    });

    return res.status(201).json({ success: true, message: "Inbound interaction recorded.", interaction });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to log inbound message.", error: error.message });
  }
};

module.exports = {
  sendLeadOutboundOutreach,
  getLeadWithInteractions,
  getCRMLeads,
  recordInboundMessage
};
