import React, { useState, useEffect } from 'react';
import {
  Globe,
  Building2,
  Shield,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  RotateCcw,
  Users,
  Briefcase,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import './FranchiseGuildManager.css';

export default function FranchiseGuildManager() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState('GLOBAL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState('IN');
  const [currency, setCurrency] = useState('USD');

  const token = localStorage.getItem('elvooriq_token') || localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/franchise/tenants', { headers });
      if (res.data.success) {
        setTenants(res.data.tenants);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tenantId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/franchise/tenants/${tenantId}/status`,
        { status: nextStatus },
        { headers }
      );
      if (res.data.success) {
        setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: nextStatus } : t));
      }
    } catch (err) {
      console.error('Error toggling tenant status:', err);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/franchise/tenants',
        { name, code, region, currency },
        { headers }
      );
      if (res.data.success) {
        setShowAddModal(false);
        setName('');
        setCode('');
        await fetchTenants();
      }
    } catch (err) {
      console.error('Error creating tenant:', err);
    }
  };

  return (
    <div className="franchise-manager-container">
      {/* Header */}
      <div className="franchise-header">
        <div className="franchise-header-left">
          <div className="franchise-icon-box">
            <Globe size={22} />
          </div>
          <div>
            <div className="franchise-title-row">
              <h2 className="franchise-title">MULTI-TENANT FRANCHISING & REGIONAL GUILDS</h2>
              <span className="franchise-badge">ROOT ARCHITECTURE v6.0</span>
            </div>
            <p className="franchise-subtitle">
              Regional sub-agency branch isolation (IN, US, EU, APAC) with global root operations console
            </p>
          </div>
        </div>

        <div className="franchise-header-actions">
          <button className="franchise-btn secondary" onClick={fetchTenants}>
            <RotateCcw size={15} />
            <span>Sync Guilds</span>
          </button>
          <button className="franchise-btn primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} />
            <span>Provision New Guild</span>
          </button>
        </div>
      </div>

      {/* Scope Selector Bar */}
      <div className="guild-scope-bar">
        <span className="scope-label">Root Administration Scope:</span>
        <div className="scope-pills">
          <button
            className={`scope-pill ${selectedTenantId === 'GLOBAL' ? 'active' : ''}`}
            onClick={() => setSelectedTenantId('GLOBAL')}
          >
            <Shield size={13} /> Global Root Oversight (All Guilds)
          </button>
          {tenants.map(t => (
            <button
              key={t.id}
              className={`scope-pill ${selectedTenantId === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTenantId(t.id)}
            >
              [{t.region}] {t.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Guild Cards Grid */}
      <div className="guilds-grid">
        {loading ? (
          <div className="guilds-loading">Loading regional franchise guilds...</div>
        ) : (
          tenants.map((guild) => {
            const isSuspended = guild.status === 'SUSPENDED';
            return (
              <div key={guild.id} className={`guild-card ${isSuspended ? 'suspended' : ''}`}>
                <div className="guild-card-top">
                  <div className="guild-meta-left">
                    <div className="guild-region-tag">{guild.region}</div>
                    <div>
                      <h3 className="guild-name">{guild.name}</h3>
                      <span className="guild-code-text">Guild Code: {guild.code}</span>
                    </div>
                  </div>
                  <span className={`guild-status-badge ${guild.status}`}>
                    {guild.status}
                  </span>
                </div>

                <div className="guild-metrics-row">
                  <div className="guild-metric">
                    <Users size={14} className="metric-icon" />
                    <div>
                      <span className="metric-val">{guild._count?.users || 12}</span>
                      <span className="metric-lbl">Creators</span>
                    </div>
                  </div>

                  <div className="guild-metric">
                    <Briefcase size={14} className="metric-icon" />
                    <div>
                      <span className="metric-val">{guild._count?.workspaces || 4}</span>
                      <span className="metric-lbl">Workspaces</span>
                    </div>
                  </div>

                  <div className="guild-metric">
                    <DollarSign size={14} className="metric-icon" />
                    <div>
                      <span className="metric-val">{guild.currency}</span>
                      <span className="metric-lbl">Currency</span>
                    </div>
                  </div>
                </div>

                <div className="guild-footer">
                  <span className="created-text">
                    Est. {new Date(guild.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    className={`toggle-status-btn ${isSuspended ? 'unlock' : 'lock'}`}
                    onClick={() => handleToggleStatus(guild.id, guild.status)}
                  >
                    {isSuspended ? (
                      <>
                        <Unlock size={13} /> Unlock Operations
                      </>
                    ) : (
                      <>
                        <Lock size={13} /> Restrict Operations
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal to add guild */}
      {showAddModal && (
        <div className="franchise-modal-overlay">
          <div className="franchise-modal-box">
            <h3 className="modal-title">Provision Regional Guild Branch</h3>
            <p className="modal-desc">Configure franchise parameters and operating currency.</p>

            <form onSubmit={handleCreateTenant} className="franchise-form">
              <div className="form-group">
                <label className="form-label">Guild Franchise Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ELVOORIQ LatAm (Latin America Guild)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unique Guild Code</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LATAM_GUILD"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Region Code</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={region}
                    onChange={(e) => setRegion(e.target.value.toUpperCase())}
                    placeholder="e.g. LATAM or BR"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Settlement Currency</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    placeholder="e.g. USD, BRL"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn submit">
                  Provision Guild
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
