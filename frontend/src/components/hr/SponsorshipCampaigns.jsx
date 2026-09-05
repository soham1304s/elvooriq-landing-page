import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  Video,
  Eye,
  AlertTriangle,
  Building,
  Check
} from 'lucide-react';
import axios from 'axios';
import './SponsorshipCampaigns.css';

export default function SponsorshipCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Campaign Form State
  const [brandName, setBrandName] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [totalEscrow, setTotalEscrow] = useState(5000);
  const [creatorId, setCreatorId] = useState('');
  const [creatorsList, setCreatorsList] = useState([]);

  const token = localStorage.getItem('elvooriq_token') || localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCampaigns();
    fetchCreators();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/campaigns', { headers });
      if (res.data.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', { headers });
      if (res.data.success) {
        const creators = res.data.users?.filter(u => u.role === 'CREATOR') || [];
        setCreatorsList(creators);
        if (creators.length > 0 && !creatorId) {
          setCreatorId(creators[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
    }
  };

  const handleResolve = async (milestoneId, action) => {
    setResolvingId(milestoneId);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/campaigns/milestone/${milestoneId}/resolve`,
        { action },
        { headers }
      );

      if (res.data.success) {
        setToastMsg({
          type: action === 'APPROVE' ? 'success' : 'warning',
          text: action === 'APPROVE'
            ? `Escrow Released! Paid $${res.data.data?.disbursement?.creatorPayout.toLocaleString()} to creator + $${res.data.data?.disbursement?.agentBonus.toLocaleString()} agent bonus (${res.data.data?.disbursement?.transactionRef})`
            : 'Deliverable submission has been rejected.'
        });
        setTimeout(() => setToastMsg(null), 5000);
        await fetchCampaigns();
      }
    } catch (err) {
      console.error('Resolution error:', err);
      setToastMsg({
        type: 'error',
        text: err.response?.data?.message || 'Transaction resolution failed'
      });
      setTimeout(() => setToastMsg(null), 5000);
    } finally {
      setResolvingId(null);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/campaigns/create',
        {
          brandName,
          campaignTitle,
          totalEscrow: Number(totalEscrow),
          creatorId: creatorId || creatorsList[0]?.id,
          currency: 'USD'
        },
        { headers }
      );
      if (res.data.success) {
        setShowCreateModal(false);
        setBrandName('');
        setCampaignTitle('');
        await fetchCampaigns();
      }
    } catch (err) {
      console.error('Campaign creation error:', err);
    }
  };

  // Metrics computation
  const totalLockedEscrow = campaigns.reduce((acc, c) => acc + (c.totalEscrow || 0), 0);
  const pendingMilestonesCount = campaigns.reduce((acc, c) => {
    return acc + (c.milestones?.filter(m => m.status === 'SUBMITTED').length || 0);
  }, 0);
  const approvedMilestones = campaigns.flatMap(c => c.milestones || []).filter(m => m.status === 'APPROVED');
  const creatorDisbursedTotal = approvedMilestones.reduce((acc, m) => acc + (m.creatorPayout || 0), 0);
  const agencyCommissionTotal = approvedMilestones.reduce((acc, m) => acc + (m.agencyCut || 0) + (m.agentBonus || 0), 0);

  return (
    <div className="sponsorship-engine-container">
      {/* Engine Header */}
      <div className="engine-header">
        <div className="engine-header-left">
          <div className="engine-icon-box">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="engine-title-row">
              <h2 className="engine-title">B2B SPONSORSHIPS & ESCROW SETTLEMENT ENGINE</h2>
              <span className="engine-badge">WIREFRAME A • ACID LEDGER DISBURSEMENTS</span>
            </div>
            <p className="engine-subtitle">
              Milestone delivery verification with automated split: 75% Creator, 20% Agency Margin, 5% Supervising Agent Bonus
            </p>
          </div>
        </div>

        <div className="engine-header-actions">
          <button className="campaign-btn secondary" onClick={fetchCampaigns}>
            <RotateCcw size={15} />
            <span>Sync Ledger</span>
          </button>
          <button className="campaign-btn primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={15} />
            <span>New Sponsorship Deal</span>
          </button>
        </div>
      </div>

      {/* Real-time Toast Feedback */}
      {toastMsg && (
        <div className={`engine-toast ${toastMsg.type}`}>
          <CheckCircle2 size={16} />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Stat Summary Cards */}
      <div className="escrow-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper locked">
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">TOTAL ESCROW IN CONTRACTS</span>
            <h3 className="stat-value">${totalLockedEscrow.toLocaleString()}</h3>
            <span className="stat-subtext">Across {campaigns.length} Brand Deals</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper pending">
            <Video size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">DELIVERABLES PENDING VERIFICATION</span>
            <h3 className="stat-value highlight">{pendingMilestonesCount}</h3>
            <span className="stat-subtext">Awaiting Video Proof Review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper disbursed">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">DISBURSED CREATOR PAYOUTS (75%)</span>
            <h3 className="stat-value success">${creatorDisbursedTotal.toLocaleString()}</h3>
            <span className="stat-subtext">Automated Bank/Crypto Settlements</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bonus">
            <Award size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">AGENCY YIELD + 5% AGENT BONUS</span>
            <h3 className="stat-value bonus">${agencyCommissionTotal.toLocaleString()}</h3>
            <span className="stat-subtext">20% Agency Cut + 5% Supervising Bonus</span>
          </div>
        </div>
      </div>

      {/* Campaigns & Milestones Listing */}
      <div className="campaigns-list-container">
        {loading ? (
          <div className="campaigns-loading">
            <RotateCcw size={24} className="spin-icon" />
            <span>Loading active sponsorship campaigns and escrow balances...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="no-campaigns">
            <Building size={40} className="empty-brand-icon" />
            <h3>No Active Brand Sponsorships</h3>
            <p>Create a new campaign to lock escrow funds and track creator deliverables.</p>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div key={camp.id} className="campaign-card">
              {/* Campaign Card Header */}
              <div className="campaign-card-header">
                <div className="brand-badge-row">
                  <div className="brand-avatar">
                    {camp.brandName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="brand-name">{camp.brandName}</h3>
                    <p className="campaign-name">{camp.campaignTitle}</p>
                  </div>
                </div>

                <div className="campaign-escrow-meta">
                  <div className="creator-assigned-pill">
                    <span className="creator-label">Talent:</span>
                    <span className="creator-val">{camp.creator?.fullName || 'Creator Talent'}</span>
                  </div>
                  <div className="total-escrow-pill">
                    <span className="escrow-label">Escrow Budget:</span>
                    <span className="escrow-val">${camp.totalEscrow?.toLocaleString()} {camp.currency}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Milestones Table */}
              <div className="milestones-table-wrap">
                <div className="milestones-table-header">
                  <span>DELIVERABLE MILESTONE</span>
                  <span>ESCROW ALLOCATION</span>
                  <span>FINANCIAL SPLIT BREAKDOWN</span>
                  <span>DELIVERABLE PROOF</span>
                  <span>SETTLEMENT ACTION</span>
                </div>

                {camp.milestones?.map((m) => {
                  let parsedMetrics = {};
                  try {
                    parsedMetrics = JSON.parse(m.proofMetrics || '{}');
                  } catch (e) {}

                  return (
                    <div key={m.id} className="milestone-row">
                      {/* Milestone Title */}
                      <div className="milestone-title-col">
                        <span className="milestone-title">{m.title}</span>
                        <span className="milestone-desc">{m.description || 'Campaign sponsored integration'}</span>
                      </div>

                      {/* Escrow Amount */}
                      <div className="milestone-escrow-col">
                        <span className="milestone-amount">${m.escrowAmount?.toLocaleString()}</span>
                        <span className={`milestone-status-tag ${m.status}`}>{m.status}</span>
                      </div>

                      {/* Split Breakdown */}
                      <div className="milestone-split-col">
                        <div className="split-line creator">
                          <span>Creator (75%):</span>
                          <strong>${m.creatorPayout?.toLocaleString()}</strong>
                        </div>
                        <div className="split-line agency">
                          <span>Agency (20%):</span>
                          <strong>${m.agencyCut?.toLocaleString()}</strong>
                        </div>
                        <div className="split-line agent">
                          <span>Agent (5%):</span>
                          <strong>${m.agentBonus?.toLocaleString()}</strong>
                        </div>
                      </div>

                      {/* Proof Link & Metrics */}
                      <div className="milestone-proof-col">
                        {m.deliverableUrl ? (
                          <div className="proof-link-card">
                            <a
                              href={m.deliverableUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="proof-url-link"
                            >
                              <Video size={13} />
                              <span className="proof-url-text">{m.deliverableUrl.replace('https://', '')}</span>
                              <ExternalLink size={11} />
                            </a>
                            {parsedMetrics.views && (
                              <div className="proof-metrics-strip">
                                <span className="proof-metric">
                                  <Eye size={11} /> {parsedMetrics.views.toLocaleString()} views
                                </span>
                                {parsedMetrics.retentionRate && (
                                  <span className="proof-metric retention">
                                    {parsedMetrics.retentionRate} retention
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="no-proof-text">Awaiting Creator Deliverable URL</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="milestone-action-col">
                        {m.status === 'APPROVED' ? (
                          <div className="disbursed-badge">
                            <Check size={14} />
                            <span>Escrow Disbursed</span>
                          </div>
                        ) : m.status === 'SUBMITTED' ? (
                          <div className="resolve-btn-group">
                            <button
                              className="resolve-btn reject"
                              onClick={() => handleResolve(m.id, 'REJECT')}
                              disabled={resolvingId === m.id}
                              title="Reject Deliverable Proof"
                            >
                              <XCircle size={14} />
                            </button>
                            <button
                              className="resolve-btn approve"
                              onClick={() => handleResolve(m.id, 'APPROVE')}
                              disabled={resolvingId === m.id}
                            >
                              <CheckCircle2 size={14} />
                              <span>{resolvingId === m.id ? 'Releasing...' : 'Approve & Release'}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="pending-badge">Pending Stream</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Campaign Creation Modal */}
      {showCreateModal && (
        <div className="campaign-modal-overlay">
          <div className="campaign-modal-box">
            <h3 className="modal-title">Provision New Brand Sponsorship</h3>
            <p className="modal-desc">Register brand escrow allocation and associate talent streamer.</p>

            <form onSubmit={handleCreateCampaign} className="campaign-form">
              <div className="form-group">
                <label className="form-label">Brand / Advertiser Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Monster Energy, NordVPN, Red Bull"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Summer Invitational Broadcast Activation"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Escrow Budget (USD)</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={totalEscrow}
                    onChange={(e) => setTotalEscrow(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Creator Talent</label>
                  <select
                    className="form-select"
                    value={creatorId}
                    onChange={(e) => setCreatorId(e.target.value)}
                  >
                    {creatorsList.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn submit">
                  Lock Escrow & Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
