import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Send,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Sparkles,
  Calendar,
  X,
  LogOut,
  Activity,
  ShieldCheck,
  Filter,
  Sliders,
  Check,
  AlertCircle,
  Search,
  Mail,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Tv,
  Award,
  TrendingUp,
  Mic
} from 'lucide-react';
import { socket } from '../socket/socketManager';
import { useNavigate } from 'react-router-dom';
import EmployeeTaskProgressSlider from '../components/employee/EmployeeTaskProgressSlider';
import WorkspaceLiveStreamPulse from '../components/streams/WorkspaceLiveStreamPulse';
import LeadOutreachChat from '../components/crm/LeadOutreachChat';
import ChannelAuditModal from '../components/audits/ChannelAuditModal';
import CreatorGrowthForecastModal from '../components/analytics/CreatorGrowthForecastModal';
import AuditionPreScreeningDesk from '../components/auditions/AuditionPreScreeningDesk';
import ContractSigningCanvas from '../components/onboarding/ContractSigningCanvas';
import LiveKanbanBoard from '../components/workspace/LiveKanbanBoard';
import logoImg from '../assets/logo.png';
import './EmployeeWorkspacePortal.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const KANBAN_COLUMNS = [
  { id: 'TODO', title: 'TO DO' },
  { id: 'IN_PROGRESS', title: 'IN PROGRESS' },
  { id: 'REVIEW', title: 'IN REVIEW' },
  { id: 'DONE', title: 'COMPLETED' },
];

const EmployeeWorkspacePortal = () => {
  const navigate = useNavigate();

  // User & Workspace context
  const [currentUser, setCurrentUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [agentStatus, setAgentStatus] = useState('Available');
  const [staffList, setStaffList] = useState([]);

  // Operational Data
  const [myLeads, setMyLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ergonomics, Comfortable Mode & Lead Filtering State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('comfortable'); // 'comfortable' | 'compact'
  const [portalTab, setPortalTab] = useState('kanban'); // 'kanban' | 'streams' | 'crm'
  const [leadSearch, setLeadSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState('ALL'); // 'ALL' | 'HIGH_SCORE' | 'NEW' | 'CONTACTED'

  // v5.0 Modals State
  const [auditCreator, setAuditCreator] = useState(null);
  const [forecastCreator, setForecastCreator] = useState(null);
  const [activeLeadOutreachId, setActiveLeadOutreachId] = useState(null);
  // v6.0 Cryptographic Contract Signing Modal
  const [contractModalCandidate, setContractModalCandidate] = useState(null);

  // Dynamic filter for leads queue
  const filteredLeads = myLeads.filter(lead => {
    const q = (leadSearch || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (lead.fullName && lead.fullName.toLowerCase().includes(q)) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.platform && lead.platform.toLowerCase().includes(q)) ||
      (lead.whatsapp && lead.whatsapp.includes(q));

    if (!matchesSearch) return false;

    if (leadFilter === 'HIGH_SCORE') return (lead.score || 0) >= 85;
    if (leadFilter === 'NEW') return lead.status === 'NEW';
    if (leadFilter === 'CONTACTED') return lead.status === 'CONTACTED';
    return true;
  });

  // Routine Progress Check-In Drawer State (Section 1.4)
  const [selectedTaskForLog, setSelectedTaskForLog] = useState(null);
  const [progressPercent, setProgressPercent] = useState(50);
  const [workLogForm, setWorkLogForm] = useState({
    hoursSpent: '1.5',
    summary: '',
    blockers: '',
    targetStatus: 'IN_PROGRESS'
  });
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);

  // Modal for Create Task
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: ''
  });

  const token = localStorage.getItem('elvooriq_token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Fetch User details, Workspaces & Staff
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resMe, resWs, resStaff] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, { headers: authHeaders }),
        fetch(`${API_URL}/api/workspaces`, { headers: authHeaders }),
        fetch(`${API_URL}/api/personnel`, { headers: authHeaders })
      ]);

      if (resMe.ok) {
        const dataMe = await resMe.json();
        setCurrentUser(dataMe.user);
      }

      if (resWs.ok) {
        const dataWs = await resWs.json();
        const wsList = dataWs.workspaces || [];
        setWorkspaces(wsList);
        if (wsList.length > 0 && !activeWorkspaceId) {
          setActiveWorkspaceId(wsList[0].id);
        }
      }

      if (resStaff.ok) {
        const dataStaff = await resStaff.json();
        setStaffList(dataStaff.personnel || []);
      }
    } catch (err) {
      console.error('Error loading initial portal context:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Tasks and Leads for the current Agent/Workspace
  const fetchWorkspaceItems = async (wsId) => {
    try {
      const queryParam = wsId ? `?workspaceId=${wsId}` : '';
      const [resTasks, resLeads] = await Promise.all([
        fetch(`${API_URL}/api/tasks${queryParam}`, { headers: authHeaders }),
        fetch(`${API_URL}/api/leads`, { headers: authHeaders }),
      ]);

      if (resTasks.ok) {
        const dTasks = await resTasks.json();
        setTasks(dTasks.tasks || []);
      }
      if (resLeads.ok) {
        const dLeads = await resLeads.json();
        setMyLeads(dLeads.leads || []);
      }
    } catch (err) {
      console.error('Error fetching workspace items:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchWorkspaceItems(activeWorkspaceId);
      socket.emit('workspace:join', { workspaceId: activeWorkspaceId });
    }
  }, [activeWorkspaceId]);

  // Real-Time Socket Listeners
  useEffect(() => {
    const handleStatusUpdated = (payload) => {
      setTasks(prev => prev.map(t => t.id === payload.taskId ? { ...t, status: payload.targetStatus } : t));
    };

    const handleProgressUpdated = (payload) => {
      if (payload.task) {
        setTasks(prev => prev.map(t => t.id === payload.task.id ? payload.task : t));
      }
    };

    const handleTaskCreated = (newTask) => {
      setTasks(prev => [newTask, ...prev]);
    };

    const handleLeadDistributed = () => {
      fetchWorkspaceItems(activeWorkspaceId);
    };

    socket.on('task:status-updated', handleStatusUpdated);
    socket.on('task:progress-updated', handleProgressUpdated);
    socket.on('task:created', handleTaskCreated);
    socket.on('lead:distributed', handleLeadDistributed);

    return () => {
      socket.off('task:status-updated', handleStatusUpdated);
      socket.off('task:progress-updated', handleProgressUpdated);
      socket.off('task:created', handleTaskCreated);
      socket.off('lead:distributed', handleLeadDistributed);
    };
  }, [activeWorkspaceId]);

  // Update Agent Live Status
  const handleStatusChange = (newStatus) => {
    setAgentStatus(newStatus);
    socket.emit('telemetry:agent-status', {
      userId: currentUser?.id,
      userName: currentUser?.fullName,
      activeWorkspaceId,
      currentAction: newStatus,
    });
  };

  // Move Task on Kanban
  const handleMoveTask = async (task, targetStatus) => {
    const originStatus = task.status;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: targetStatus } : t));

    try {
      const res = await fetch(`${API_URL}/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: targetStatus, originStatus })
      });

      if (!res.ok) {
        fetchWorkspaceItems(activeWorkspaceId);
      } else {
        socket.emit('task:dragged', {
          taskId: task.id,
          originStatus,
          targetStatus,
          workspaceId: activeWorkspaceId,
          userId: currentUser?.id,
        });
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Open Routine Progress Check-In Drawer
  const openProgressDrawer = (task) => {
    setSelectedTaskForLog(task);
    const currProg = task.progressPercent !== undefined && task.progressPercent !== null
      ? task.progressPercent
      : (task.status === 'DONE' ? 100 : 25);
    setProgressPercent(currProg);
    setWorkLogForm({
      hoursSpent: '1.5',
      summary: '',
      blockers: '',
      targetStatus: currProg === 100 ? 'DONE' : 'IN_PROGRESS',
    });
  };

  // Commit Routine Progress Check-In (Section 1.4)
  const handleSubmitRoutineProgress = async (e) => {
    e.preventDefault();
    if (!selectedTaskForLog) return;

    try {
      setIsSubmittingProgress(true);
      const res = await fetch(`${API_URL}/api/tasks/${selectedTaskForLog.id}/progress`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          progressPercent: parseInt(progressPercent, 10),
          hoursSpent: parseFloat(workLogForm.hoursSpent) || 0,
          summary: workLogForm.summary || `Routine check-in: ${progressPercent}% accomplished`,
          blockers: workLogForm.blockers || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local tasks list with returned payload
        setTasks(prev => prev.map(t => t.id === selectedTaskForLog.id ? data.task : t));
        setSelectedTaskForLog(null);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to update routine progress');
      }
    } catch (err) {
      console.error('Error saving routine progress:', err);
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...newTaskForm,
          workspaceId: activeWorkspaceId,
          assigneeId: newTaskForm.assigneeId || currentUser?.id
        })
      });

      if (res.ok) {
        setShowCreateTaskModal(false);
        setNewTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
        fetchWorkspaceItems(activeWorkspaceId);
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Update Lead Status
  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      fetchWorkspaceItems(activeWorkspaceId);
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('elvooriq_token');
    localStorage.removeItem('elvooriq_user');
    navigate('/login');
  };

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="agent-portal-container">
      {/* Top Header */}
      <header className="agent-portal-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoImg} alt="ELVOORIQ Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
          <span className="role-indicator">AGENT WORKSPACE PORTAL • V2.0</span>
        </div>

        {/* Header Center Controls */}
        <div className="header-center">
          {/* Workspace Selector */}
          <div className="workspace-selector-box">
            <Layers size={15} className="ws-icon" />
            <select
              value={activeWorkspaceId}
              onChange={(e) => setActiveWorkspaceId(e.target.value)}
              className="ws-dropdown"
            >
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Real-time Agent State Selector */}
          <div className="agent-status-selector">
            <span className="status-label">OPERATIONAL STATUS:</span>
            <select
              value={agentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`status-dropdown status-${agentStatus.toLowerCase()}`}
            >
              <option value="Available">🟢 Available / Routine Active</option>
              <option value="In Call">🟡 In Call with Talent</option>
              <option value="Evaluating Leads">🔵 Scoring Applications</option>
              <option value="Away">⚪ Away / Standby</option>
            </select>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="header-right">
          {/* Proportions & View Mode Toggle */}
          <button
            className={`comfort-mode-toggle ${viewMode}`}
            onClick={() => setViewMode(v => v === 'comfortable' ? 'compact' : 'comfortable')}
            title={`Currently in ${viewMode === 'comfortable' ? 'Comfortable Mode' : 'Compact View'}. Click to toggle.`}
          >
            <Sliders size={14} />
            <span>{viewMode === 'comfortable' ? 'Comfortable Mode' : 'Compact Mode'}</span>
          </button>

          <div className="agent-profile-pill">
            <div className="agent-avatar">
              {currentUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="agent-name-box">
              <span className="name">{currentUser?.fullName || 'Agent'}</span>
              <span className="role">{currentUser?.employment?.jobTitle || 'Talent Specialist'}</span>
            </div>
          </div>

          {currentUser?.role === 'ADMIN' && (
            <button className="admin-switch-btn" onClick={() => navigate('/admin-panel')}>
              <ShieldCheck size={15} />
              <span>Admin ERP</span>
            </button>
          )}

          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Body with Dynamic Mode */}
      <div className={`agent-portal-body mode-${viewMode}`}>
        {/* LEFT SIDEBAR: MY ASSIGNED LEADS */}
        <aside className={`agent-leads-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
          {!isSidebarOpen ? (
            <div className="sidebar-collapsed-strip">
              <button
                className="expand-sidebar-pill"
                onClick={() => setIsSidebarOpen(true)}
                title="Expand Leads Queue"
              >
                <PanelLeftOpen size={18} />
                <span className="collapsed-pill-count">{myLeads.length}</span>
              </button>
            </div>
          ) : (
            <div className="sidebar-inner-content">
              <div className="sidebar-header">
                <div className="sidebar-title-row">
                  <div className="title-with-sparkle">
                    <Sparkles size={16} className="sparkle-teal" />
                    <h3>High-Velocity Leads</h3>
                  </div>
                  <span className="leads-badge">{filteredLeads.length} of {myLeads.length}</span>
                </div>
                <button
                  className="collapse-sidebar-btn"
                  onClick={() => setIsSidebarOpen(false)}
                  title="Collapse sidebar to widen Kanban board"
                >
                  <PanelLeftClose size={15} />
                </button>
              </div>

              <p className="sidebar-subtitle">Applications assigned to you based on workload routing.</p>

              {/* Quick Search & Filter Chips */}
              <div className="leads-search-row">
                <div className="leads-search-input-wrapper">
                  <Search size={13} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Filter by name, email, platform..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="leads-search-input"
                  />
                  {leadSearch && (
                    <button className="clear-search-btn" onClick={() => setLeadSearch('')}>
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="leads-filter-pills">
                  <button
                    type="button"
                    className={`filter-pill ${leadFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setLeadFilter('ALL')}
                  >
                    All ({myLeads.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${leadFilter === 'HIGH_SCORE' ? 'active' : ''}`}
                    onClick={() => setLeadFilter('HIGH_SCORE')}
                  >
                    Score 85+
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${leadFilter === 'NEW' ? 'active' : ''}`}
                    onClick={() => setLeadFilter('NEW')}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${leadFilter === 'CONTACTED' ? 'active' : ''}`}
                    onClick={() => setLeadFilter('CONTACTED')}
                  >
                    Contacted
                  </button>
                </div>
              </div>

              {/* Leads Card Stack */}
              <div className="leads-card-stack">
                {filteredLeads.length === 0 ? (
                  <div className="empty-leads-notice">
                    <Users size={32} className="muted-icon" />
                    <p>{leadSearch ? 'No leads match your search criteria.' : 'No creator leads assigned to you yet.'}</p>
                    {leadSearch && (
                      <button className="reset-search-btn" onClick={() => { setLeadSearch(''); setLeadFilter('ALL'); }}>
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredLeads.map(lead => {
                    const score = lead.score || 75;
                    const scoreTone = score >= 90 ? 'score-high' : score >= 75 ? 'score-mid' : 'score-low';
                    const platformClass = `platform-${(lead.platform || 'general').toLowerCase()}`;
                    const cleanPhone = lead.whatsapp ? lead.whatsapp.replace(/\D/g, '') : null;

                    return (
                      <div key={lead.id} className="lead-queue-card">
                        <div className="lead-card-header">
                          <span className={`lead-platform-tag ${platformClass}`}>
                            {lead.platform || 'Creator'}
                          </span>
                          <span className={`lead-score-pill ${scoreTone}`}>
                            <span className="score-pulse-dot" />
                            Score: {score}
                          </span>
                        </div>

                        <div className="lead-identity-row">
                          <div className="lead-avatar-circle">
                            {lead.fullName ? lead.fullName.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div className="lead-name-block">
                            <h4 className="lead-name">{lead.fullName}</h4>
                            <a href={`mailto:${lead.email}`} className="lead-email" title="Email Creator">
                              <Mail size={12} />
                              <span>{lead.email}</span>
                            </a>
                          </div>
                        </div>

                        <div className="lead-meta-row">
                          <span className="reach-pill" title="Estimated Reach">
                            {lead.followers ? `${(lead.followers / 1000).toFixed(0)}K Reach` : 'Talent'}
                          </span>

                          {cleanPhone ? (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(lead.fullName || '')},%20I'm%20reaching%20out%20from%20ELVOORIQ.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="whatsapp-contact-pill active"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare size={12} />
                              <span>{lead.whatsapp}</span>
                            </a>
                          ) : (
                            <span className="whatsapp-contact-pill muted">
                              No WhatsApp
                            </span>
                          )}
                        </div>

                        <div className="lead-status-footer">
                          <span className="status-stage-label">STAGE</span>
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                            className={`lead-status-select status-${lead.status.toLowerCase()}`}
                          >
                            <option value="NEW">🟢 NEW LEAD</option>
                            <option value="OUTREACH_SENT">📤 OUTREACH SENT</option>
                            <option value="CONTACTED">🟡 CONTACTED</option>
                            <option value="INTERVIEWED">🔵 INTERVIEWED</option>
                            <option value="SIGNED">💎 SIGNED PARTNER</option>
                            <option value="REJECTED">⚪ ARCHIVED</option>
                          </select>
                        </div>

                        <button
                          className="lead-outreach-desk-btn"
                          onClick={() => {
                            setActiveLeadOutreachId(lead.id);
                            setPortalTab('crm');
                          }}
                          title="Open Omnichannel Outreach Conversation Desk"
                        >
                          <MessageSquare size={12} />
                          <span>Omnichannel Outreach</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT AREA: INTERACTIVE KANBAN BOARD / STREAMS DESK / CRM */}
        <main className="agent-kanban-area">
          {/* Dedicated Workspace Sub-Navigation Bar */}
          <div className="workspace-subnav-bar">
            <div className="workspace-subnav-left">
              {!isSidebarOpen && (
                <button
                  className="reopen-leads-btn"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Reopen leads sidebar"
                >
                  <PanelLeftOpen size={15} />
                  <span>Leads ({myLeads.length})</span>
                </button>
              )}
              <div className="workspace-subnav-meta">
                <h2 className="subnav-title">
                  {portalTab === 'live_kanban' && 'Live Synchronized Tasks Kanban (Zero-Mock)'}
                  {portalTab === 'kanban' && (activeWs?.name || 'Workspace Team Board')}
                  {portalTab === 'streams' && 'Live Stream Monitoring Desk'}
                  {portalTab === 'crm' && 'Lead Outreach & CRM Desk'}
                  {portalTab === 'auditions' && 'Pre-Screening Auditions & Vocal Dynamics'}
                </h2>
                <p className="subnav-subtitle">
                  {portalTab === 'live_kanban' && 'Live ACID database-backed task synchronization with transactional check-in sliders'}
                  {portalTab === 'kanban' && `${tasks.length} tasks • ${tasks.filter(t => t.status === 'IN_PROGRESS').length} in progress • ${tasks.filter(t => t.status === 'DONE').length} delivered`}
                  {portalTab === 'streams' && 'Real-time audience retention, GMV, and audit scoring for creator streams'}
                  {portalTab === 'crm' && 'Omnichannel talent conversations across Instagram DM, WhatsApp, and Email'}
                  {portalTab === 'auditions' && 'Candidate vocal pacing (WPM), speech cadence, and real-time AI suitability evaluation'}
                </p>
              </div>
            </div>

            {/* Segmented Operation Tabs */}
            <div className="workspace-view-tabs">
              <button
                className={`workspace-tab-btn ${portalTab === 'live_kanban' ? 'active' : ''}`}
                onClick={() => setPortalTab('live_kanban')}
              >
                <Sliders size={13} />
                <span>Live Kanban</span>
                <span className="live-pill-mini">DB</span>
              </button>
              <button
                className={`workspace-tab-btn ${portalTab === 'kanban' ? 'active' : ''}`}
                onClick={() => setPortalTab('kanban')}
              >
                <Layers size={13} />
                <span>Team Board</span>
              </button>
              <button
                className={`workspace-tab-btn ${portalTab === 'streams' ? 'active' : ''}`}
                onClick={() => setPortalTab('streams')}
              >
                <Radio size={13} />
                <span>Live Streams</span>
                <span className="live-pill-mini">PULSE</span>
              </button>
              <button
                className={`workspace-tab-btn ${portalTab === 'crm' ? 'active' : ''}`}
                onClick={() => setPortalTab('crm')}
              >
                <MessageSquare size={13} />
                <span>Outreach Desk</span>
              </button>
              <button
                className={`workspace-tab-btn ${portalTab === 'auditions' ? 'active' : ''}`}
                onClick={() => setPortalTab('auditions')}
              >
                <Mic size={13} />
                <span>Audition Desk</span>
                <span className="live-pill-mini audition-wpm">WPM</span>
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="workspace-subnav-right">
              {portalTab === 'kanban' && (
                <button
                  className="add-task-btn"
                  onClick={() => setShowCreateTaskModal(true)}
                >
                  <Plus size={15} />
                  <span>Create Task</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content Container */}
          <div className="workspace-tab-content-wrapper">
            {portalTab === 'live_kanban' ? (
              <div className="portal-subview-scrollable" style={{ padding: '20px' }}>
                <LiveKanbanBoard />
              </div>
            ) : portalTab === 'streams' ? (
              <div className="portal-subview-scrollable">
                <WorkspaceLiveStreamPulse
                  workspaceId={activeWorkspaceId}
                  onOpenAudit={(c) => setAuditCreator(c)}
                  onOpenForecast={(c) => setForecastCreator(c)}
                />
              </div>
            ) : portalTab === 'crm' ? (
              <div className="portal-crm-view-container">
                <LeadOutreachChat
                  initialLeadId={activeLeadOutreachId}
                />
              </div>
            ) : portalTab === 'auditions' ? (
              <div className="portal-subview-scrollable">
                <AuditionPreScreeningDesk
                  onOpenContractModal={(cand) => setContractModalCandidate(cand)}
                />
              </div>
            ) : (
              <div className="portal-kanban-board-container">
                {/* Kanban Columns Grid */}
                <div className="kanban-board-grid">
                  {KANBAN_COLUMNS.map((col, colIdx) => {
                    const colTasks = tasks.filter(t => t.status === col.id);
                    return (
                      <div key={col.id} className="kanban-column">
                        <div className="kanban-col-header">
                          <span className="col-title">{col.title}</span>
                          <span className="col-counter">{colTasks.length}</span>
                        </div>

                        <div className="kanban-cards-stack">
                          {colTasks.length === 0 ? (
                            <div className="empty-column-placeholder">No items in {col.title}</div>
                          ) : (
                            colTasks.map(task => {
                              const priorityClass = `priority-${(task.priority || 'MEDIUM').toLowerCase()}`;
                              const progress = task.progressPercent || 0;
                              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

                              return (
                                <div key={task.id} className={`kanban-task-card ${isOverdue ? 'card-overdue' : ''}`}>
                                  <div className="card-top-row">
                                    <span className={`task-priority-tag ${priorityClass}`}>
                                      {task.priority || 'MEDIUM'}
                                    </span>

                                    {task.isDeliveredOnTime && (
                                      <span className="ontime-badge" title="Delivered On-Time">
                                        <CheckCircle2 size={11} /> ON-TIME
                                      </span>
                                    )}

                                    {isOverdue && (
                                      <span className="overdue-badge" title="Deadline has passed">
                                        <AlertTriangle size={11} /> OVERDUE
                                      </span>
                                    )}

                                    {task.dueDate && (
                                      <span className="task-due-date">
                                        <Clock size={11} />
                                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="task-title">{task.title}</h4>
                                  {task.description && (
                                    <p className="task-desc">{task.description}</p>
                                  )}

                                  {/* Milestone Progress Bar */}
                                  <div className="task-progress-box">
                                    <div className="progress-info-row">
                                      <span className="progress-label">Milestone Progress</span>
                                      <span className="progress-value">{progress}%</span>
                                    </div>
                                    <div className="progress-bar-track">
                                      <div
                                        className={`progress-bar-fill ${progress === 100 ? 'complete' : ''}`}
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Card Bottom Meta */}
                                  <div className="card-footer-row">
                                    <div className="assignee-meta">
                                      <div className="assignee-mini-avatar">
                                        {task.assignee?.fullName?.charAt(0) || 'U'}
                                      </div>
                                      <span className="assignee-name">
                                        {task.assignee?.fullName || 'Unassigned'}
                                      </span>
                                    </div>

                                    {/* Quick Column Shift Controls */}
                                    <div className="step-controls">
                                      {colIdx > 0 && (
                                        <button
                                          className="step-btn prev"
                                          title="Move Back"
                                          onClick={() => handleMoveTask(task, KANBAN_COLUMNS[colIdx - 1].id)}
                                        >
                                          <ChevronLeft size={14} />
                                        </button>
                                      )}
                                      {colIdx < KANBAN_COLUMNS.length - 1 && (
                                        <button
                                          className="step-btn next"
                                          title="Move Forward"
                                          onClick={() => {
                                            const nextCol = KANBAN_COLUMNS[colIdx + 1].id;
                                            if (nextCol === 'DONE') {
                                              openProgressDrawer(task);
                                            } else {
                                              handleMoveTask(task, nextCol);
                                            }
                                          }}
                                        >
                                          <ChevronRight size={14} />
                                        </button>
                                      )}
                                    </div>

                                    {/* Routine Check-In & Progress Button */}
                                    <button
                                      className="log-work-btn"
                                      onClick={() => openProgressDrawer(task)}
                                      title="Open Routine Progress Check-In Slider"
                                    >
                                      <Sliders size={13} />
                                      <span>Check-In</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SLIDE-OVER DRAWER: ROUTINE PROGRESS CHECK-IN (SECTION 1.4) */}
      <AnimatePresence>
        {selectedTaskForLog && (
          <div className="drawer-backdrop" onClick={() => setSelectedTaskForLog(null)}>
            <motion.div
              className="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="drawer-header">
                <div>
                  <span className="drawer-pretitle">ROUTINE CHECK-IN & PROGRESS SLIDER</span>
                  <h3>Update Task Milestone</h3>
                </div>
                <button className="drawer-close-btn" onClick={() => setSelectedTaskForLog(null)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '16px 0' }}>
                <EmployeeTaskProgressSlider
                  task={selectedTaskForLog}
                  onUpdateSuccess={(updatedTask) => {
                    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
                    setTimeout(() => setSelectedTaskForLog(null), 1500);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE TASK MODAL */}
      {showCreateTaskModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Add Task to {activeWs?.name || 'Workspace'}</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Coordinate talent stream schedule"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Task Description</label>
                <textarea
                  placeholder="Provide context, deliverables, and guidelines..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    value={newTaskForm.assigneeId}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assigneeId: e.target.value })}
                  >
                    <option value="">Assign to Me ({currentUser?.fullName})</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.employment?.jobTitle || s.role})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTaskForm.dueDate}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Add Task to Board</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* v5.0 Creator Channel Coaching Audit Modal */}
      {auditCreator && (
        <ChannelAuditModal
          creator={auditCreator}
          onClose={() => setAuditCreator(null)}
          onAuditSubmitted={() => { }}
        />
      )}

      {/* v5.0 Predictive Creator Growth Analytics Modal */}
      {forecastCreator && (
        <CreatorGrowthForecastModal
          creator={forecastCreator}
          onClose={() => setForecastCreator(null)}
        />
      )}

      {/* v6.0 Dynamic Cryptographic Contract Signing Modal */}
      {contractModalCandidate && (
        <ContractSigningCanvas
          candidate={contractModalCandidate}
          onClose={() => setContractModalCandidate(null)}
          onSignedSuccess={() => {
            setContractModalCandidate(null);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeWorkspacePortal;

