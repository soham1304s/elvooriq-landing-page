import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  Search, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  User, 
  ChevronRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import './LeadOutreachChat.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const PRE_APPROVED_TEMPLATES = {
  WHATSAPP: [
    { 
      name: "Streamer Partnership Invitation", 
      text: "Hi {{name}}, we reviewed your profile and loved your streams! Let's discuss a premier talent management partnership with ELVOORIQ." 
    },
    { 
      name: "70/30 Commission Breakdown", 
      text: "Hey {{name}}, our standard agency contract guarantees 70% of live gift payouts directly to you, with full studio and overlay sponsorship from ELVOORIQ." 
    },
    { 
      name: "Workspace Roster Welcome", 
      text: "Hello {{name}}, your talent clearance is confirmed. We are assigning you to a dedicated talent agent to elevate your viewer retention." 
    }
  ],
  SMS: [
    { 
      name: "Quick Streamer Followup", 
      text: "[ELVOORIQ] Hi {{name}}, we sent an email regarding your streamer application. Let's schedule a brief onboarding call." 
    },
    { 
      name: "Urgent Live Audit Notice", 
      text: "[ELVOORIQ Alert] Hi {{name}}, your assigned agent has scheduled an upcoming channel audit. Check your workspace portal." 
    }
  ],
  EMAIL: [
    { 
      name: "Official Agency Offer", 
      text: "Dear {{name}},\n\nOn behalf of ELVOORIQ Live-Streaming Agency, we are thrilled to offer you a spot on our roster. Our team will coordinate your live streaming operations, handle platform negotiations, and provide dedicated talent coaching.\n\nBest regards,\nELVOORIQ Talent Operations" 
    },
    { 
      name: "Platform Split Terms", 
      text: "Dear {{name}},\n\nHere are the terms of our agency split agreement:\n- Creator Share: 70% of gross earnings\n- Agency Cut: 30% covering production, management & marketing\n\nPlease let us know if you have any questions.\n\nELVOORIQ Operations" 
    }
  ]
};

export default function LeadOutreachChat({ initialLeadId, onClose }) {
  const [leadsList, setLeadsList] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId || null);
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [channel, setChannel] = useState('WHATSAPP');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const token = localStorage.getItem('elvooriq_token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch all leads for sidebar
  const fetchLeadsList = async () => {
    try {
      const res = await fetch(`${API_URL}/api/crm/leads`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeadsList(data.leads || []);
        if (!selectedLeadId && data.leads && data.leads.length > 0) {
          setSelectedLeadId(data.leads[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load leads list:", err);
    }
  };

  // Fetch full details of the active selected lead
  const fetchActiveLeadData = async (leadId) => {
    if (!leadId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/crm/leads/${leadId}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok && data.success) {
        setLead(data.lead);
        setMessages(data.lead.interactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch lead parameters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsList();
  }, []);

  useEffect(() => {
    if (selectedLeadId) {
      fetchActiveLeadData(selectedLeadId);
    }
  }, [selectedLeadId]);

  const applyTemplate = (tplText) => {
    if (!lead) return;
    const cleanName = lead.fullName || 'Creator';
    const personalized = tplText.replace(/\{\{name\}\}/g, cleanName);
    setInputText(personalized);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedLeadId) return;
    setSending(true);
    setActionNotice('');

    try {
      const res = await fetch(`${API_URL}/api/crm/outreach/send`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          leadId: selectedLeadId,
          channel,
          messageText: inputText,
          templateName: selectedTemplate || "Custom_Outreach"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInputText('');
        setSelectedTemplate('');
        setActionNotice(`Message dispatched successfully over ${channel}.`);
        fetchActiveLeadData(selectedLeadId);
        fetchLeadsList();
      } else {
        alert(`Failed to send: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert("Outbound connection error: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSimulateInbound = async () => {
    if (!selectedLeadId) return;
    try {
      const replies = [
        "Hey, thanks for reaching out! I'd love to learn more about your 70/30 split.",
        "That sounds awesome. What streaming equipment or support do you provide?",
        "Sounds good! When is a good time for a call?"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const res = await fetch(`${API_URL}/api/crm/inbound/simulate`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          leadId: selectedLeadId,
          channel,
          messageText: randomReply
        })
      });

      if (res.ok) {
        fetchActiveLeadData(selectedLeadId);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  const filteredLeads = leadsList.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (l.fullName && l.fullName.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.platform && l.platform.toLowerCase().includes(q))
    );
  });

  return (
    <div className="omnichannel-desk-container">
      {/* Col 1: Lead Directory */}
      <div className="omni-leads-sidebar">
        <div className="omni-leads-header">
          <h4 className="omni-leads-title">
            <MessageSquare size={14} />
            Creator Lead Queue
          </h4>
          <input 
            type="text"
            className="omni-leads-search"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="omni-leads-scroll">
          {filteredLeads.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center', padding: '20px 8px' }}>
              No leads found.
            </div>
          ) : (
            filteredLeads.map((l) => (
              <div 
                key={l.id}
                className={`omni-lead-item ${selectedLeadId === l.id ? 'selected' : ''}`}
                onClick={() => setSelectedLeadId(l.id)}
              >
                <div className="omni-lead-item-top">
                  <span className="omni-lead-name">{l.fullName}</span>
                  <span className={`omni-lead-channel-tag ${
                    l.whatsapp ? 'channel-tag-whatsapp' : 'channel-tag-email'
                  }`}>
                    {l.whatsapp ? 'WA' : 'EMAIL'}
                  </span>
                </div>
                <div className="omni-lead-item-bottom">
                  <span>{l.platform || 'Creator'}</span>
                  <span>Score: {l.score || 70}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Col 2: Active Conversation Desk */}
      <div className="omni-conversation-column">
        {lead ? (
          <>
            <div className="omni-convo-header">
              <div>
                <div className="omni-convo-title">
                  {lead.fullName}
                  <span className="omni-status-chip">
                    {lead.status}
                  </span>
                </div>
                <div className="omni-convo-subtitle">
                  {lead.email} {lead.whatsapp ? `• ${lead.whatsapp}` : ''} • Reach: {lead.followers || 0}
                </div>
              </div>

              {onClose && (
                <button 
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Message Thread */}
            <div className="omni-messages-stream">
              {messages.length === 0 ? (
                <div className="omni-empty-stream">
                  <Sparkles size={28} style={{ color: '#199580', margin: '0 auto 10px' }} />
                  <p>No communication logs recorded yet for <strong>{lead.fullName}</strong>.</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '6px' }}>Select an outreach template on the right and dispatch via WhatsApp, SMS or Email.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isOutbound = m.direction === 'OUTBOUND';
                  return (
                    <div key={m.id} className={`omni-msg-wrapper ${isOutbound ? 'outbound' : 'inbound'}`}>
                      <div className="omni-msg-bubble">
                        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{m.messageText}</p>
                      </div>
                      <div className="omni-msg-meta">
                        <span>{m.channel}</span>
                        <span>•</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span style={{ color: isOutbound ? '#2dd4bf' : '#94a3b8' }}>
                          {m.deliveryStatus || 'SENT'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Input Dock */}
            <div className="omni-input-dock">
              {actionNotice && (
                <div style={{ fontSize: '0.72rem', color: '#2dd4bf', background: 'rgba(25,149,128,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  ✓ {actionNotice}
                </div>
              )}
              <textarea 
                className="omni-textarea"
                placeholder={`Draft outbound ${channel} outreach message for ${lead.fullName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="omni-input-actions">
                <span className="omni-target-channel-badge">
                  Channel: <strong style={{ color: '#2dd4bf' }}>{channel}</strong>
                </span>

                <button 
                  className="omni-dispatch-btn"
                  onClick={handleSendMessage}
                  disabled={sending || !inputText.trim()}
                >
                  <Send size={13} />
                  {sending ? 'Sending...' : 'Dispatch Message'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
            <User size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>Select a lead from the directory to open conversation desk.</p>
          </div>
        )}
      </div>

      {/* Col 3: Channel Controls & Templates */}
      <div className="omni-controls-sidebar">
        <div>
          <div className="omni-section-heading">Outreach Channel</div>
          <div className="omni-channel-grid">
            {['WHATSAPP', 'SMS', 'EMAIL'].map((ch) => (
              <button 
                key={ch}
                className={`omni-channel-btn ${channel === ch ? 'active' : ''}`}
                onClick={() => { setChannel(ch); setSelectedTemplate(''); }}
              >
                {ch === 'WHATSAPP' && 'WhatsApp'}
                {ch === 'SMS' && 'SMS'}
                {ch === 'EMAIL' && 'Email'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="omni-section-heading">Pre-Approved Templates</div>
          <div className="omni-templates-list">
            {(PRE_APPROVED_TEMPLATES[channel] || []).map((tpl, i) => (
              <div 
                key={i}
                className={`omni-template-card ${selectedTemplate === tpl.name ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTemplate(tpl.name);
                  applyTemplate(tpl.text);
                }}
              >
                <div className="omni-template-title">{tpl.name}</div>
                <div className="omni-template-snippet">{tpl.text}</div>
              </div>
            ))}
          </div>
        </div>

        {lead && (
          <div>
            <div className="omni-section-heading">Lead Parameters</div>
            <div className="omni-lead-summary-box">
              <div className="omni-summary-row">
                <span className="omni-summary-label">Full Name:</span>
                <span className="omni-summary-val">{lead.fullName}</span>
              </div>
              <div className="omni-summary-row">
                <span className="omni-summary-label">Platform:</span>
                <span className="omni-summary-val">{lead.platform || 'N/A'}</span>
              </div>
              <div className="omni-summary-row">
                <span className="omni-summary-label">Followers:</span>
                <span className="omni-summary-val">{(lead.followers || 0).toLocaleString()}</span>
              </div>
              <div className="omni-summary-row">
                <span className="omni-summary-label">Calculated Score:</span>
                <span className="omni-summary-val" style={{ color: '#2dd4bf' }}>{lead.score || 70}/100</span>
              </div>
              <div className="omni-summary-row">
                <span className="omni-summary-label">Current Stage:</span>
                <span className="omni-summary-val">{lead.status}</span>
              </div>
            </div>

            <button 
              className="omni-simulate-btn"
              onClick={handleSimulateInbound}
              title="Test creator response inbound simulation"
            >
              <Zap size={11} style={{ display: 'inline', marginRight: '4px' }} />
              Simulate Lead Inbound Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
