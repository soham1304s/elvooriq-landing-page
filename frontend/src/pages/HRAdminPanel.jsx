import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Layers, 
  Activity, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Video, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  Zap,
  Clock,
  LogOut,
  FileText,
  UploadCloud,
  Check,
  Sparkles,
  Award,
  AlertTriangle,
  FileCheck2,
  Calendar, 
  DollarSign,
  CreditCard,
  Sliders,
  Globe
} from 'lucide-react';
import { socket } from '../socket/socketManager';
import { useNavigate } from 'react-router-dom';
import OfferLetterVerification from '../components/hr/OfferLetterVerification';
import OfferLetterBuilder from '../components/hr/OfferLetterBuilder';
import ComplianceAuditor from '../components/hr/ComplianceAuditor';
import SponsorshipCampaigns from '../components/hr/SponsorshipCampaigns';
import FranchiseGuildManager from '../components/franchise/FranchiseGuildManager';
import logoImg from '../assets/logo.png';
import { performLogout } from '../utils/authSession';
import SessionTelemetryWidget from '../components/SessionTelemetryWidget';
import './HRAdminPanel.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const HRAdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'tasks' | 'onboarding' | 'reports' | 'workspaces' | 'leads' | 'telemetry' | 'showcase'

  // Data states
  const [personnel, setPersonnel] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [leads, setLeads] = useState([]);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Direct Task Delegation State (Section 4.2 & Wireframe B)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: ''
  });
  const [assigningTask, setAssigningTask] = useState(false);
  const [taskSuccessMsg, setTaskSuccessMsg] = useState('');

  // Offer Letter Ingestion & Compliance State (v7.0)
  const [onboardingSubTab, setOnboardingSubTab] = useState('generator'); // 'generator' | 'compliance' | 'legacy_nlp'
  const [refreshComplianceCounter, setRefreshComplianceCounter] = useState(0);
  const [selectedEmployeeForOffer, setSelectedEmployeeForOffer] = useState('');
  const [offerPdfFile, setOfferPdfFile] = useState(null);
  const [parsingOffer, setParsingOffer] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [offerCommitSuccess, setOfferCommitSuccess] = useState('');

  // Monthly Quality Report State (EPS)
  const [selectedReportYear, setSelectedReportYear] = useState(2026);
  const [selectedReportMonth, setSelectedReportMonth] = useState(new Date().getMonth());
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Delete User Profile State
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // v4.0 Financial Payroll Ledger State (Wireframe B)
  const currentMonthPeriod = new Date().toISOString().slice(0, 7); // e.g. "2026-03"
  const [payrolls, setPayrolls] = useState([]);
  const [payrollPeriod, setPayrollPeriod] = useState(currentMonthPeriod);
  const [payrollFilter, setPayrollFilter] = useState('ALL');
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [payrollActionMsg, setPayrollActionMsg] = useState('');

  // Modals for Payroll Adjust & Disburse
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [targetAdjustLedger, setTargetAdjustLedger] = useState(null);
  const [adjustAllowances, setAdjustAllowances] = useState(0);
  const [adjustDeductions, setAdjustDeductions] = useState(0);

  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [targetDisburseLedger, setTargetDisburseLedger] = useState(null);
  const [disburseTxnId, setDisburseTxnId] = useState('');
  const [disburseMethod, setDisburseMethod] = useState('NEFT_IMPS');

  // v4.0 Intelligent Lead Router & Fail-Safe Queue State (Wireframe D)
  const [leadQueue, setLeadQueue] = useState([]);
  const [queueActionMsg, setQueueActionMsg] = useState('');
  const [redistributingQueue, setRedistributingQueue] = useState(false);

  // v5.0 Platform Commission Statement Ingestion & Dynamic Splits Hub (Wireframe C)
  const [splitsList, setSplitsList] = useState([]);
  const [splitAnalytics, setSplitAnalytics] = useState({ totalGross: 0, totalAgencyCut: 0, totalAgentBonuses: 0, unsyncedCount: 0 });
  const [splitBillingCycle, setSplitBillingCycle] = useState('September-2026');
  const [splitCommissionRate, setSplitCommissionRate] = useState('30.0');
  const [splitCsvFile, setSplitCsvFile] = useState(null);
  const [parsingSplits, setParsingSplits] = useState(false);
  const [splitIngestResult, setSplitIngestResult] = useState(null);
  const [splitSyncNotice, setSplitSyncNotice] = useState('');

  // Modals & Forms
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddWorkspaceModal, setShowAddWorkspaceModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ fullName: '', email: '', jobTitle: '', department: 'TALENT_MANAGEMENT', baseSalary: 80000 });
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '', agentId: '' });

  // Showcase state
  const [featuredUrl, setFeaturedUrl] = useState('');
  const [featuredTitle, setFeaturedTitle] = useState('');
  const [featuredVideos, setFeaturedVideos] = useState([]);

  const token = localStorage.getItem('elvooriq_token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch v5.0 Commission Splits
  const fetchCommissionSplits = async () => {
    try {
      const res = await fetch(`${API_URL}/api/commission/splits`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok && data.success) {
        setSplitsList(data.splits || []);
        if (data.analytics) setSplitAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Failed to fetch commission splits:", err);
    }
  };

  // Ingest Commission CSV
  const handleUploadCommissionCSV = async (e) => {
    e.preventDefault();
    if (!splitCsvFile) {
      alert("Please select a platform payout CSV file.");
      return;
    }

    try {
      setParsingSplits(true);
      setSplitIngestResult(null);
      const formData = new FormData();
      formData.append('statement', splitCsvFile);
      formData.append('billingCycle', splitBillingCycle);
      formData.append('commissionRate', splitCommissionRate);

      const res = await fetch(`${API_URL}/api/commission/ingest-splits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSplitIngestResult(data);
        fetchCommissionSplits();
      } else {
        alert(data.message || "Failed to process commission statement CSV.");
      }
    } catch (err) {
      console.error("CSV Ingest error:", err);
      alert("Error ingesting statement CSV: " + err.message);
    } finally {
      setParsingSplits(false);
    }
  };

  // Sync Split to Payroll
  const handleSyncSplitToPayroll = async (splitId) => {
    try {
      const res = await fetch(`${API_URL}/api/commission/splits/${splitId}/sync`, {
        method: 'PATCH',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSplitSyncNotice(`Commission split synced to payroll disbursement ledger.`);
        fetchCommissionSplits();
        setTimeout(() => setSplitSyncNotice(''), 3000);
      }
    } catch (err) {
      console.error("Split sync error:", err);
    }
  };

  // Helper to generate a sample platform payout statement CSV
  const handleGenerateSampleCSV = () => {
    const sample = "CreatorPlatformId,PlatformName,GrossRevenueUSD\ncreator_aishwarya_99,Twitch,12450.00\nv5_creator@elvooriq.com,YouTube,8120.00\nstreamer_vince_99,TikTok,5340.00";
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], `Platform_Statement_${splitBillingCycle}.csv`, { type: 'text/csv' });
    setSplitCsvFile(file);
  };

  // Format remaining time on hold (Wireframe D)
  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'Active Hold';
    const diffMs = new Date(expiresAt) - new Date();
    if (diffMs <= 0) return 'Expired';
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m left`;
  };

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resPers, resUsers, resWs, resLeads, resVid, resEmp, resTasks, resPayroll, resQueue] = await Promise.all([
        fetch(`${API_URL}/api/personnel`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/users`, { headers: authHeaders }),
        fetch(`${API_URL}/api/workspaces`, { headers: authHeaders }),
        fetch(`${API_URL}/api/leads`, { headers: authHeaders }),
        fetch(`${API_URL}/api/featured/videos`),
        fetch(`${API_URL}/api/hr/employees`, { headers: authHeaders }),
        fetch(`${API_URL}/api/tasks`, { headers: authHeaders }),
        fetch(`${API_URL}/api/payroll/period?period=${payrollPeriod}`, { headers: authHeaders }),
        fetch(`${API_URL}/api/leads/queue/all`, { headers: authHeaders }),
      ]);

      if (resPers.ok) {
        const data = await resPers.json();
        setPersonnel(data.personnel || []);
      }
      if (resUsers.ok) {
        const data = await resUsers.json();
        setAllUsers(data.users || []);
      }
      if (resEmp.ok) {
        const data = await resEmp.json();
        setActiveEmployees(data.employees || []);
      }
      if (resTasks.ok) {
        const data = await resTasks.json();
        setTasks(data.tasks || []);
      }
      if (resWs.ok) {
        const data = await resWs.json();
        setWorkspaces(data.workspaces || []);
      }
      if (resLeads.ok) {
        const data = await resLeads.json();
        setLeads(data.leads || []);
      }
      if (resVid.ok) {
        const data = await resVid.json();
        setFeaturedVideos(Array.isArray(data) ? data : []);
      }
      if (resPayroll.ok) {
        const data = await resPayroll.json();
        setPayrolls(data.payrolls || []);
      }
      if (resQueue.ok) {
        const data = await resQueue.json();
        setLeadQueue(data.queuedLeads || []);
      }
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Payroll Ledgers by Period
  const fetchPayrolls = async (period = payrollPeriod) => {
    try {
      const res = await fetch(`${API_URL}/api/payroll/period?period=${period}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setPayrolls(data.payrolls || []);
      }
    } catch (err) {
      console.error('Failed to fetch payroll ledgers:', err);
    }
  };

  // Generate Draft Payroll Batch
  const handleGenerateDraftPayroll = async () => {
    try {
      setGeneratingPayroll(true);
      setPayrollActionMsg('');
      const res = await fetch(`${API_URL}/api/payroll/generate-draft`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ period: payrollPeriod })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPayrollActionMsg(`Draft payroll batch generated (${data.count} personnel).`);
        fetchPayrolls(payrollPeriod);
      } else {
        alert(data.message || 'Failed to generate payroll batch.');
      }
    } catch (err) {
      console.error('Error generating payroll batch:', err);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  // Approve Single Payroll Ledger
  const handleApprovePayroll = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/payroll/${id}/approve`, {
        method: 'PUT',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPayrollActionMsg('Payroll ledger approved for disbursement.');
        fetchPayrolls(payrollPeriod);
      } else {
        alert(data.message || 'Failed to approve payroll.');
      }
    } catch (err) {
      console.error('Error approving payroll:', err);
    }
  };

  // Commit Adjustment Modal
  const handleCommitAdjustment = async (e) => {
    e.preventDefault();
    if (!targetAdjustLedger) return;
    try {
      const res = await fetch(`${API_URL}/api/payroll/${targetAdjustLedger.id}/adjust`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          allowances: Number(adjustAllowances) || 0,
          deductions: Number(adjustDeductions) || 0
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAdjustModal(false);
        setTargetAdjustLedger(null);
        setPayrollActionMsg(`Adjustments committed for ${targetAdjustLedger.employee?.fullName}`);
        fetchPayrolls(payrollPeriod);
      } else {
        alert(data.message || 'Failed to adjust payroll.');
      }
    } catch (err) {
      console.error('Error adjusting payroll:', err);
    }
  };

  // Commit Disbursement Modal
  const handleCommitDisbursement = async (e) => {
    e.preventDefault();
    if (!targetDisburseLedger || !disburseTxnId) {
      alert('Banking Transaction ID is required for disbursement audit.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/payroll/${targetDisburseLedger.id}/disburse`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          transactionId: disburseTxnId,
          method: disburseMethod
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowDisburseModal(false);
        setTargetDisburseLedger(null);
        setDisburseTxnId('');
        setPayrollActionMsg(`Funds disbursed successfully (Txn: ${data.disbursement?.transactionId})`);
        fetchPayrolls(payrollPeriod);
      } else {
        alert(data.message || 'Failed to disburse payroll.');
      }
    } catch (err) {
      console.error('Error disbursing payroll:', err);
    }
  };

  // Fetch Fail-Safe Lead Queue
  const fetchLeadQueue = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leads/queue/all`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setLeadQueue(data.queuedLeads || []);
      }
    } catch (err) {
      console.error('Failed to fetch lead queue:', err);
    }
  };

  // Force Batch Redistribution
  const handleForceRedistribute = async () => {
    try {
      setRedistributingQueue(true);
      setQueueActionMsg('');
      const res = await fetch(`${API_URL}/api/leads/queue/force-redistribute`, {
        method: 'POST',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const assigned = data.assignedCount ?? data.redistributedCount ?? 0;
        const remaining = data.remainingCount ?? data.remainingInQueue ?? 0;
        setQueueActionMsg(data.message || `Redistribution cycle finished: ${assigned} leads assigned, ${remaining} remaining in hold.`);
        fetchLeadQueue();
        fetchData();
      } else {
        alert(data.message || 'Redistribution error.');
      }
    } catch (err) {
      console.error('Force redistribute error:', err);
    } finally {
      setRedistributingQueue(false);
    }
  };

  // Reroute Offline Agents
  const handleRerouteOffline = async () => {
    try {
      setQueueActionMsg('');
      const res = await fetch(`${API_URL}/api/leads/queue/reroute-offline`, {
        method: 'POST',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQueueActionMsg(`Rerouted ${data.reroutedCount} leads from offline personnel.`);
        fetchLeadQueue();
        fetchData();
      } else {
        alert(data.message || 'Reroute error.');
      }
    } catch (err) {
      console.error('Reroute offline error:', err);
    }
  };

  // Fetch Monthly Quality Report (EPS)
  const fetchMonthlyReports = async (year, month) => {
    try {
      setReportsLoading(true);
      const res = await fetch(`${API_URL}/api/admin/reports/monthly?year=${year}&month=${month}`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setMonthlyReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch monthly reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMonthlyReports(selectedReportYear, selectedReportMonth);

    // Socket.IO Telemetry Setup
    socket.emit('admin:join');

    const handleTelemetryLog = (log) => {
      setTelemetryLogs(prev => [log, ...prev.slice(0, 49)]);
      if (log.type === 'LEAD_ROUTED' || log.type === 'LEAD_UPDATED') {
        fetch(`${API_URL}/api/leads`, { headers: authHeaders })
          .then(r => r.json())
          .then(d => { if (d.leads) setLeads(d.leads); })
          .catch(() => {});
      }
      if (log.type === 'USER_ACTIVATION_CHANGE' || log.type === 'TASK_PROGRESS_COMMIT') {
        fetchData();
      }
    };

    const handleLeadDistributed = (payload) => {
      setTelemetryLogs(prev => [{
        type: 'LEAD_DISTRIBUTED',
        message: `High-Velocity Lead: ${payload.fullName} (Score: ${payload.score}) routed to Agent: ${payload.agentName || payload.agentId}`,
        timestamp: new Date().toISOString(),
        meta: payload
      }, ...prev.slice(0, 49)]);
    };

    socket.on('telemetry:log', handleTelemetryLog);
    socket.on('lead:distributed', handleLeadDistributed);

    return () => {
      socket.off('telemetry:log', handleTelemetryLog);
      socket.off('lead:distributed', handleLeadDistributed);
    };
  }, []);

  // Activate, Suspend, or Reject User Account (Section 1.2 & 3.3 Gatekeeper)
  const handleToggleUserActivation = async (userId, actionOrStatus, isEnabled) => {
    try {
      const payload = typeof actionOrStatus === 'string' && ['approve', 'reject', 'suspend'].includes(actionOrStatus)
        ? { action: actionOrStatus }
        : { status: actionOrStatus, isEnabled };

      const res = await fetch(`${API_URL}/api/admin/users/${userId}/activate`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update user activation state:', err);
    }
  };

  // Permanently Delete User Profile from Database
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.email === 'root.admin@elvooriq.com') {
      alert('Security Violation: Root Administrator cannot be deleted.');
      setUserToDelete(null);
      return;
    }

    try {
      setIsDeletingUser(true);
      const res = await fetch(`${API_URL}/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        setUserToDelete(null);
        fetchData();
      } else {
        alert(data.message || 'Failed to delete user profile.');
      }
    } catch (err) {
      console.error('Failed to delete user profile:', err);
      alert('Network error while deleting profile.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Dispatch Operational Task to Active Employee (Section 4.2 & Wireframe B)
  const handleDispatchTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.assigneeId) {
      alert('Task Title and Employee Assignee are required.');
      return;
    }

    try {
      setAssigningTask(true);
      setTaskSuccessMsg('');

      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(taskForm)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTaskSuccessMsg(`Task "${data.task.title}" successfully assigned and scheduled!`);
        setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
        fetchData();
      } else {
        alert(data.message || 'Failed to dispatch task.');
      }
    } catch (err) {
      console.error('Error dispatching task:', err);
      alert('Failed to dispatch task.');
    } finally {
      setAssigningTask(false);
    }
  };

  // Upload & Parse Offer Letter PDF
  const handleParseOfferLetter = async (e) => {
    e.preventDefault();
    if (!offerPdfFile || !selectedEmployeeForOffer) {
      alert('Please select an employee and choose a PDF offer letter.');
      return;
    }

    try {
      setParsingOffer(true);
      setParsedPreview(null);
      setOfferCommitSuccess('');

      const formData = new FormData();
      formData.append('offerLetter', offerPdfFile);
      formData.append('employeeUserId', selectedEmployeeForOffer);

      const res = await fetch(`${API_URL}/api/onboarding/offer-letter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setParsedPreview(data.preview);
      } else {
        alert(data.message || 'Failed to parse offer letter PDF.');
      }
    } catch (err) {
      console.error('Error during offer letter upload:', err);
      alert('Failed to upload and parse offer letter.');
    } finally {
      setParsingOffer(false);
    }
  };

  // Commit Parsed Offer Letter to Employment Record
  const handleCommitOfferRecord = async () => {
    if (!parsedPreview) return;

    try {
      const res = await fetch(`${API_URL}/api/onboarding/commit-offer`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(parsedPreview)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOfferCommitSuccess('Employment profile committed and verified successfully!');
        fetchData();
        setTimeout(() => {
          setParsedPreview(null);
          setOfferPdfFile(null);
          setOfferCommitSuccess('');
        }, 3000);
      } else {
        alert(data.message || 'Failed to commit employment record.');
      }
    } catch (err) {
      console.error('Commit offer error:', err);
    }
  };

  // Create Employee manually
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/personnel`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newEmployee)
      });
      if (res.ok) {
        setShowAddEmployeeModal(false);
        setNewEmployee({ fullName: '', email: '', jobTitle: '', department: 'TALENT_MANAGEMENT', baseSalary: 80000 });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create employee:', err);
    }
  };

  // Create Workspace
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/workspaces`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newWorkspace)
      });
      if (res.ok) {
        setShowAddWorkspaceModal(false);
        setNewWorkspace({ name: '', description: '', agentId: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  // Update Lead Status or Reassign Agent
  const handleUpdateLead = async (leadId, updates) => {
    try {
      const res = await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  };

  // Save Featured Video
  const handleSaveVideo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/featured/video`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ youtubeUrl: featuredUrl, title: featuredTitle }),
      });
      if (res.ok) {
        setFeaturedUrl('');
        setFeaturedTitle('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to save featured video:', err);
    }
  };

  const handleLogout = () => {
    performLogout('ADMIN_LOGOUT');
  };

  // Dynamic Metrics
  const activeAgentsCount = allUsers.filter(u => u.role === 'EMPLOYEE' && u.status === 'ACTIVE').length;
  const pendingApprovalsCount = allUsers.filter(u => u.status === 'PENDING').length;
  const openLeadsCount = leads.filter(l => !['SIGNED', 'REJECTED'].includes(l.status)).length;
  const activeWorkspacesCount = workspaces.length;

  return (
    <div className="hr-panel-container">
      {/* Top Banner & Header */}
      <header className="hr-panel-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoImg} alt="ELVOORIQ Logo" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
          <span className="panel-title-badge">HR / OPERATIONS ERP • V2.0</span>
        </div>

        {/* Top Metric Ribbon */}
        <div className="top-metrics-ribbon">
          <div className="metric-box">
            <span className="metric-label">ACTIVE AGENTS</span>
            <span className="metric-val">{activeAgentsCount}</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-box">
            <span className="metric-label">PENDING APPROVALS</span>
            <span className={`metric-val ${pendingApprovalsCount > 0 ? 'highlight-amber' : ''}`}>
              {pendingApprovalsCount}
            </span>
          </div>
          <div className="metric-divider" />
          <div className="metric-box">
            <span className="metric-label">OPEN LEADS</span>
            <span className="metric-val highlight">{openLeadsCount}</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-box">
            <span className="metric-label">WORKSPACES</span>
            <span className="metric-val">{activeWorkspacesCount}</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-box">
            <span className="metric-label">TELEMETRY</span>
            <span className="metric-status-live">
              <span className="status-ping" />
              <span>ONLINE</span>
            </span>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SessionTelemetryWidget />
          <button className="workspace-switch-btn" onClick={() => navigate('/workspace-portal')}>
            <Briefcase size={15} />
            <span>Agent Portal</span>
          </button>
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Panel Layout with Sidebar & Content */}
      <div className="hr-panel-body">
        {/* Navigation Sidebar */}
        <aside className="hr-panel-sidebar">
          <div className="sidebar-section-title">ADMINISTRATION & COMPLIANCE</div>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'roster' ? 'active' : ''}`}
              onClick={() => setActiveTab('roster')}
            >
              <Users size={18} />
              <span>Personnel & Clearance</span>
              {pendingApprovalsCount > 0 && <span className="nav-badge amber-badge">{pendingApprovalsCount}</span>}
            </button>

            <button 
              className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <Briefcase size={18} />
              <span>Task Delegation</span>
              <span className="nav-badge teal-badge">{tasks.length}</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'onboarding' ? 'active' : ''}`}
              onClick={() => setActiveTab('onboarding')}
            >
              <FileText size={18} />
              <span>Onboarding & Offers</span>
              <span className="nav-badge teal-badge">v7.0</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <Award size={18} />
              <span>Monthly Quality (EPS)</span>
              <span className="nav-badge teal-badge">V2.0</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'payroll' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('payroll');
                fetchPayrolls(payrollPeriod);
              }}
            >
              <DollarSign size={18} />
              <span>Payroll Ledger</span>
              <span className="nav-badge teal-badge">v4.0</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'commissions' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('commissions');
                fetchCommissionSplits();
              }}
            >
              <CreditCard size={18} />
              <span>Commission Splits</span>
              <span className="nav-badge teal-badge">v5.0</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'sponsorships' ? 'active' : ''}`}
              onClick={() => setActiveTab('sponsorships')}
            >
              <DollarSign size={18} />
              <span>B2B Sponsorship Escrows</span>
              <span className="nav-badge teal-badge">v6.0</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'franchise' ? 'active' : ''}`}
              onClick={() => setActiveTab('franchise')}
            >
              <Globe size={18} />
              <span>Franchise & Guilds</span>
              <span className="nav-badge auto-badge">REGIONAL</span>
            </button>

            <div className="sidebar-section-title">OPERATIONS</div>

            <button 
              className={`nav-item ${activeTab === 'workspaces' ? 'active' : ''}`}
              onClick={() => setActiveTab('workspaces')}
            >
              <Layers size={18} />
              <span>Workspaces</span>
              <span className="nav-badge">{workspaces.length}</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              <Zap size={18} />
              <span>Lead Hub (Scored)</span>
              <span className="nav-badge highlight">{openLeadsCount}</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'telemetry' ? 'active' : ''}`}
              onClick={() => setActiveTab('telemetry')}
            >
              <Activity size={18} />
              <span>Live Telemetry</span>
              <span className="nav-badge live">LIVE</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'showcase' ? 'active' : ''}`}
              onClick={() => setActiveTab('showcase')}
            >
              <Video size={18} />
              <span>Media Showcase</span>
            </button>
          </nav>
        </aside>

        {/* Content Viewport */}
        <main className="hr-panel-content">
          {/* TAB 1: PERSONNEL ROSTER & ADMINISTRATIVE GATEKEEPER */}
          {activeTab === 'roster' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="view-header">
                <div>
                  <h2>AGENCY ROSTER & DUAL-STATUS GATEKEEPER</h2>
                  <p>Enterprise two-tier clearance, role configuration, compensation, and activation management.</p>
                </div>
                <div className="view-header-actions">
                  <button 
                    className="secondary-action-btn"
                    onClick={() => setActiveTab('onboarding')}
                  >
                    <UploadCloud size={16} />
                    <span>Ingest PDF Offer</span>
                  </button>
                  <button 
                    className="primary-action-btn"
                    onClick={() => setShowAddEmployeeModal(true)}
                  >
                    <Plus size={16} />
                    <span>Onboard Personnel</span>
                  </button>
                </div>
              </div>

              {pendingApprovalsCount > 0 && (
                <div className="pending-roster-alert">
                  <AlertTriangle size={18} />
                  <span>
                    <strong>Action Required:</strong> {pendingApprovalsCount} self-registered accounts are currently PENDING Root Admin approval. Click 'Approve & Activate' to grant system clearance.
                  </span>
                </div>
              )}

              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>PERSONNEL</th>
                      <th>SYSTEM ROLE</th>
                      <th>JOB TITLE</th>
                      <th>SALARY / MO</th>
                      <th>ACCOUNT STATUS</th>
                      <th>CLEARANCE</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => {
                      const isPending = user.status === 'PENDING' || !user.isEnabled;
                      const isSuspended = user.status === 'SUSPENDED';
                      const empRecord = user.employmentRecord;

                      return (
                        <tr key={user.id} className={isPending ? 'row-pending' : ''}>
                          <td>
                            <div className="personnel-profile">
                              <div className="avatar-circle">
                                {user.fullName ? user.fullName.charAt(0) : 'U'}
                              </div>
                              <div>
                                <div className="person-name">{user.fullName}</div>
                                <div className="person-email">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`role-tag role-${user.role.toLowerCase()}`}>{user.role}</span>
                          </td>
                          <td>
                            <span className="title-tag">{empRecord?.jobTitle || 'Talent Specialist'}</span>
                          </td>
                          <td>
                            <div className="salary-val">
                              {empRecord ? `${empRecord.currency || 'INR'} ${empRecord.baseSalary?.toLocaleString()}` : 'Not Configured'}
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${user.status.toLowerCase()}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <span className={`clearance-pill ${user.isEnabled ? 'enabled' : 'disabled'}`}>
                              {user.isEnabled ? 'ENABLED' : 'LOCKED'}
                            </span>
                          </td>
                          <td>
                            <div className="actions-cell">
                              {isPending ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="btn-approve-clear"
                                    onClick={() => handleToggleUserActivation(user.id, 'approve')}
                                    title="Clear and Activate Account"
                                  >
                                    <CheckCircle size={14} />
                                    <span>Approve</span>
                                  </button>
                                  <button 
                                    className="btn-suspend-account"
                                    style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                                    onClick={() => handleToggleUserActivation(user.id, 'reject')}
                                    title="Reject Account Request"
                                  >
                                    <span>Reject</span>
                                  </button>
                                </div>
                              ) : isSuspended ? (
                                <button 
                                  className="btn-approve-clear"
                                  onClick={() => handleToggleUserActivation(user.id, 'approve')}
                                  title="Restore Account Clearance"
                                >
                                  <CheckCircle size={14} />
                                  <span>Reactivate</span>
                                </button>
                              ) : (
                                <button 
                                  className="btn-suspend-account"
                                  onClick={() => handleToggleUserActivation(user.id, 'suspend')}
                                  title="Revoke Clearance"
                                >
                                  <AlertCircle size={14} />
                                  <span>Suspend</span>
                                </button>
                              )}

                              <button 
                                className="table-icon-btn"
                                title="Attach / Ingest Offer Letter"
                                onClick={() => {
                                  setSelectedEmployeeForOffer(user.id);
                                  setActiveTab('onboarding');
                                }}
                              >
                                <FileText size={14} />
                              </button>

                              {user.email !== 'root.admin@elvooriq.com' && (
                                <button 
                                  className="btn-delete-account"
                                  title="Delete User Profile"
                                  onClick={() => setUserToDelete(user)}
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: DIRECT TASK CREATOR & DELEGATOR (SECTION 4.2 & WIREFRAME B) */}
          {activeTab === 'tasks' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="view-header">
                <div>
                  <h2>SECTION I: DIRECT TASK CREATOR & DELEGATOR</h2>
                  <p>Assign operational milestones to verified active staff. Programmatic deadlines trigger automated hourly SMS cron alerts.</p>
                </div>
              </div>

              <div className="offer-ingestion-grid">
                {/* Form: Assign and Dispatch */}
                <div className="ingestion-form-card" style={{ background: 'rgba(13, 17, 19, 0.85)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                  <div className="card-header-iconic">
                    <Briefcase size={22} className="teal-icon" />
                    <h3>Dispatch Operational Task</h3>
                  </div>

                  {taskSuccessMsg && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>
                      ✓ {taskSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleDispatchTask} className="offer-upload-form">
                    <div className="form-group">
                      <label>Task Title</label>
                      <input 
                        type="text" 
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        placeholder="e.g. Complete Overdue Overland Contract"
                        className="std-input"
                        style={{ width: '100%', background: '#0A0A0A', borderColor: '#334155', color: '#f8fafc', padding: '10px', borderRadius: '6px' }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description & Scope</label>
                      <textarea 
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        placeholder="Review social metrics, contract deliverables, and platform data..."
                        rows="3"
                        style={{ width: '100%', background: '#0A0A0A', borderColor: '#334155', color: '#f8fafc', padding: '10px', borderRadius: '6px', resize: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label>Priority</label>
                        <select 
                          value={taskForm.priority}
                          onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                          className="std-select"
                          style={{ width: '100%', background: '#0A0A0A', borderColor: '#334155', color: '#f8fafc', padding: '10px', borderRadius: '6px' }}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Target Deadline (Due Date)</label>
                        <input 
                          type="datetime-local" 
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                          style={{ width: '100%', background: '#0A0A0A', borderColor: '#334155', color: '#f8fafc', padding: '10px', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Assignee (Active Verified Staff Directory)</label>
                      <select 
                        value={taskForm.assigneeId}
                        onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                        className="std-select"
                        style={{ width: '100%', background: '#0A0A0A', borderColor: '#334155', color: '#f8fafc', padding: '10px', borderRadius: '6px' }}
                        required
                      >
                        <option value="">Select From Active Staff (Verified)...</option>
                        {activeEmployees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName || emp.name} ({emp.jobTitle}) - {emp.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="primary-action-btn full-width"
                      disabled={assigningTask}
                      style={{ marginTop: '8px', padding: '12px' }}
                    >
                      {assigningTask ? 'Dispatching Milestone...' : '➕ ASSIGN AND DISPATCH TASK'}
                    </button>
                  </form>
                </div>

                {/* Assigned Milestones Monitor */}
                <div className="ingestion-preview-card" style={{ background: 'rgba(13, 17, 19, 0.85)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                  <div className="card-header-iconic">
                    <Clock size={22} className="teal-icon" />
                    <h3>Active Assigned Milestones ({tasks.length})</h3>
                  </div>

                  <div style={{ maxHeight: '480px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tasks.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                        No operational milestones currently active.
                      </p>
                    ) : (
                      tasks.map(t => (
                        <div key={t.id} style={{ background: '#0A0A0A', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#f8fafc' }}>{t.title}</span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 'bold',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: t.status === 'DONE' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                              color: t.status === 'DONE' ? '#4ADE80' : '#D4AF37'
                            }}>
                              {t.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                            <span>Assignee: <strong style={{ color: '#e2e8f0' }}>{t.assignee?.fullName || 'Staff'}</strong></span>
                            <span>Progress: <strong style={{ color: '#D4AF37' }}>{t.progressPercent || 0}%</strong></span>
                          </div>
                          {t.dueDate && (
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                              Deadline: {new Date(t.dueDate).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DYNAMIC OFFER LETTER GENERATION & COMPLIANCE VAULT (v7.0) */}
          {activeTab === 'onboarding' && (
            <motion.div 
              className="tab-view offer-ingestion-view space-y-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* v7.0 Sub-Tab Navigator */}
              <div className="flex items-center gap-2 p-1.5 bg-[#0A0A0A] border border-[#2A2520] rounded-xl max-w-2xl">
                <button
                  type="button"
                  onClick={() => setOnboardingSubTab('generator')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    onboardingSubTab === 'generator'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5C542] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Dynamic Offer Generator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOnboardingSubTab('compliance')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    onboardingSubTab === 'compliance'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5C542] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>Compliance Vault Audit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOnboardingSubTab('legacy_nlp')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    onboardingSubTab === 'legacy_nlp'
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <FileText size={14} />
                  <span>Legacy NLP</span>
                </button>
              </div>

              {/* Sub-Tab 1: Dynamic Offer Letter Generator (v7.0) */}
              {onboardingSubTab === 'generator' && (
                <OfferLetterBuilder 
                  onOfferCreated={() => {
                    setRefreshComplianceCounter(c => c + 1);
                    fetchData();
                  }} 
                />
              )}

              {/* Sub-Tab 2: Compliance Document Auditor (v7.0) */}
              {onboardingSubTab === 'compliance' && (
                <ComplianceAuditor refreshSignal={refreshComplianceCounter} />
              )}

              {/* Sub-Tab 3: Legacy PDF Ingestion & Heuristics */}
              {onboardingSubTab === 'legacy_nlp' && (
                <div className="space-y-6">
                  <div className="section-hero-banner">
                    <div className="section-hero-content">
                      <div className="section-tag">
                        <ShieldCheck size={14} />
                        <span>SECTION II • CONTRACT INTELLIGENCE</span>
                      </div>
                      <h2 className="section-hero-title">
                        Salary Configuration & Offer Letter Ingestion
                      </h2>
                      <p className="section-hero-desc">
                        In-memory PDF contract parsing and metadata verification studio. Automatically extracts compensation, ISO currency, designation, and start date with heuristic regex lookaround tokens.
                      </p>
                    </div>
                  </div>

                  {/* Employee Selector Bar */}
                  <div className="target-staff-selector-card">
                    <div className="selector-card-header">
                      <div className="selector-title-wrap">
                        <UserCheck size={18} className="selector-icon" />
                        <div>
                          <span className="selector-label">Target Staff Member for Offer Attachment</span>
                          <p className="selector-sublabel">Select an employee from the verified roster to link this contract to their employment record.</p>
                        </div>
                      </div>
                    </div>

                    <div className="selector-dropdown-row">
                      <select 
                        value={selectedEmployeeForOffer} 
                        onChange={(e) => setSelectedEmployeeForOffer(e.target.value)}
                        className="custom-staff-select"
                      >
                        <option value="">Select Employee Roster Record...</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} • {u.email} ({u.role}) — [{u.status}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedEmployeeForOffer && (() => {
                      const targetUser = allUsers.find(u => u.id === selectedEmployeeForOffer);
                      if (!targetUser) return null;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="selected-staff-pill-preview"
                        >
                          <div className="staff-preview-avatar">
                            {targetUser.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EM'}
                          </div>
                          <div className="staff-preview-meta">
                            <span className="staff-preview-name">{targetUser.fullName}</span>
                            <span className="staff-preview-email">{targetUser.email}</span>
                          </div>
                          <div className="staff-preview-badges">
                            <span className="staff-role-badge">{targetUser.role}</span>
                            <span className={`staff-status-badge ${targetUser.status?.toLowerCase()}`}>
                              {targetUser.status}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </div>

                  <OfferLetterVerification 
                    userId={selectedEmployeeForOffer}
                    employeeName={allUsers.find(u => u.id === selectedEmployeeForOffer)?.fullName}
                    onSyncComplete={fetchData}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: MONTHLY QUALITY REPORTING (EPS ENGINE) */}
          {activeTab === 'reports' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="view-header">
                <div>
                  <h2>MONTHLY QUALITY REPORTING & EPS ENGINE</h2>
                  <p>Mathematical Employee Performance Score (EPS) evaluating completion rate, on-time milestones, and routine check-ins.</p>
                </div>

                {/* Period Selector Controls */}
                <div className="report-controls-bar">
                  <select 
                    value={selectedReportMonth} 
                    onChange={(e) => {
                      const m = parseInt(e.target.value);
                      setSelectedReportMonth(m);
                      fetchMonthlyReports(selectedReportYear, m);
                    }}
                    className="report-select"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={idx} value={idx}>{name}</option>
                    ))}
                  </select>

                  <select 
                    value={selectedReportYear} 
                    onChange={(e) => {
                      const y = parseInt(e.target.value);
                      setSelectedReportYear(y);
                      fetchMonthlyReports(y, selectedReportMonth);
                    }}
                    className="report-select"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>

                  <button 
                    className="refresh-btn"
                    onClick={() => fetchMonthlyReports(selectedReportYear, selectedReportMonth)}
                    disabled={reportsLoading}
                  >
                    <RefreshCw size={15} className={reportsLoading ? 'spinning' : ''} />
                    <span>Recalculate EPS</span>
                  </button>
                </div>
              </div>

              {/* High-Level Team Summary Ribbon */}
              <div className="eps-summary-ribbon">
                <div className="eps-summary-tile">
                  <span className="tile-label">EVALUATED PERSONNEL</span>
                  <span className="tile-num">{monthlyReports.length}</span>
                </div>
                <div className="eps-summary-tile">
                  <span className="tile-label">ENTERPRISE ELITE (A+)</span>
                  <span className="tile-num green">
                    {monthlyReports.filter(r => r.performanceTier?.startsWith('A+')).length}
                  </span>
                </div>
                <div className="eps-summary-tile">
                  <span className="tile-label">TEAM AVERAGE EPS</span>
                  <span className="tile-num teal">
                    {monthlyReports.length > 0 
                      ? Math.round(monthlyReports.reduce((acc, r) => acc + (r.performanceScore || 0), 0) / monthlyReports.length)
                      : 0} / 100
                  </span>
                </div>
              </div>

              {/* Employee EPS Cards Grid */}
              <div className="eps-cards-grid">
                {monthlyReports.length === 0 ? (
                  <div className="empty-reports-notice">
                    <Award size={48} className="muted-icon" />
                    <p>No employee activity recorded for {MONTH_NAMES[selectedReportMonth]} {selectedReportYear}.</p>
                  </div>
                ) : (
                  monthlyReports.map(report => {
                    const tierClass = report.performanceScore >= 90 ? 'tier-aplus' : 
                      report.performanceScore >= 80 ? 'tier-a' :
                      report.performanceScore >= 70 ? 'tier-b' :
                      report.performanceScore >= 50 ? 'tier-c' : 'tier-d';

                    return (
                      <div key={report.employeeId} className={`eps-employee-card ${tierClass}`}>
                        <div className="eps-card-top">
                          <div>
                            <h3 className="emp-name">{report.employeeName}</h3>
                            <span className="emp-title">{report.jobTitle}</span>
                          </div>
                          <div className={`tier-badge-pill ${tierClass}`}>
                            {report.performanceTier}
                          </div>
                        </div>

                        {/* Score Display Ring */}
                        <div className="score-hero-display">
                          <div className="score-circle">
                            <span className="score-number">{report.performanceScore}</span>
                            <span className="score-unit">/ 100</span>
                          </div>
                          <div className="score-period-tag">{report.reportingPeriod}</div>
                        </div>

                        {/* Core Performance Metrics */}
                        <div className="eps-metrics-matrix">
                          <div className="matrix-item">
                            <span className="m-val">{report.tasksAssigned}</span>
                            <span className="m-label">Assigned</span>
                          </div>
                          <div className="matrix-item">
                            <span className="m-val green">{report.completedCount}</span>
                            <span className="m-label">Completed</span>
                          </div>
                          <div className="matrix-item">
                            <span className="m-val red">{report.overdueCount}</span>
                            <span className="m-label">Overdue</span>
                          </div>
                          <div className="matrix-item">
                            <span className="m-val">{report.totalHoursLogged}h</span>
                            <span className="m-label">Hours</span>
                          </div>
                        </div>

                        {/* Progress Percentages */}
                        <div className="eps-progress-bars-container">
                          <div className="bar-row">
                            <div className="bar-label-line">
                              <span>Completion Rate (CR)</span>
                              <span>{report.completionRate}%</span>
                            </div>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width: `${Math.min(100, report.completionRate)}%` }} />
                            </div>
                          </div>

                          <div className="bar-row">
                            <div className="bar-label-line">
                              <span>On-Time Milestone Delivery (OTCR)</span>
                              <span>{report.onTimeCompletionRate}%</span>
                            </div>
                            <div className="bar-track">
                              <div className="bar-fill on-time" style={{ width: `${Math.min(100, report.onTimeCompletionRate)}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Qualitative Evaluation Box */}
                        <div className="qualitative-box">
                          <span className="box-title">QUALITATIVE EVALUATION</span>
                          <p>{report.qualitativeEvaluation}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: FINANCIAL PAYROLL LEDGER & DISBURSEMENT ENGINE (WIREFRAME B) */}
          {activeTab === 'payroll' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="view-header">
                <div>
                  <h2>FINANCIAL PAYROLL LEDGER & DISBURSEMENT ENGINE</h2>
                  <p>Enterprise wage calculation, dynamic adjustments, and cryptographically verified disbursement rails.</p>
                </div>
                <div className="payroll-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="payroll-period-picker">
                    <label>Period:</label>
                    <input 
                      type="month"
                      value={payrollPeriod}
                      onChange={(e) => {
                        setPayrollPeriod(e.target.value);
                        fetchPayrolls(e.target.value);
                      }}
                      className="payroll-select"
                    />
                  </div>
                  <button 
                    className="primary-action-btn"
                    onClick={handleGenerateDraftPayroll}
                    disabled={generatingPayroll}
                  >
                    <RefreshCw size={15} className={generatingPayroll ? 'spinning' : ''} />
                    <span>{generatingPayroll ? 'Generating...' : 'Generate Draft Batch'}</span>
                  </button>
                </div>
              </div>

              {payrollActionMsg && (
                <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)', color: '#F5C542', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} />
                  <span>{payrollActionMsg}</span>
                </div>
              )}

              {/* Status Filter Tabs */}
              <div className="payroll-filter-bar" style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                {['ALL', 'DRAFT', 'APPROVED', 'DISBURSED'].map((filterState) => (
                  <button
                    key={filterState}
                    onClick={() => setPayrollFilter(filterState)}
                    style={{
                      background: payrollFilter === filterState ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                      border: payrollFilter === filterState ? '1px solid #D4AF37' : '1px solid #2A2520',
                      color: payrollFilter === filterState ? '#F5C542' : '#A8A29A',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {filterState}
                  </button>
                ))}
              </div>

              {/* Summary Metric Ribbon */}
              {(() => {
                const filtered = payrolls.filter(p => payrollFilter === 'ALL' || p.status === payrollFilter);
                const totalCommitment = filtered.reduce((acc, p) => acc + (p.netSalary || 0), 0);
                const totalBase = filtered.reduce((acc, p) => acc + (p.baseSalary || 0), 0);
                const totalAllowances = filtered.reduce((acc, p) => acc + (p.allowances || 0), 0);
                const totalDeductions = filtered.reduce((acc, p) => acc + (p.deductions || 0), 0);
                const disbursedCount = filtered.filter(p => p.status === 'DISBURSED').length;

                return (
                  <>
                    <div className="payroll-summary-grid">
                      <div className="payroll-stat-card">
                        <span className="payroll-stat-label">Net Commitment ({payrollPeriod})</span>
                        <span className="payroll-stat-val highlight">₹{totalCommitment.toLocaleString()}</span>
                      </div>
                      <div className="payroll-stat-card">
                        <span className="payroll-stat-label">Base Compensation</span>
                        <span className="payroll-stat-val">₹{totalBase.toLocaleString()}</span>
                      </div>
                      <div className="payroll-stat-card">
                        <span className="payroll-stat-label">Allowances / Incentives</span>
                        <span className="payroll-stat-val" style={{ color: '#34d399' }}>+ ₹{totalAllowances.toLocaleString()}</span>
                      </div>
                      <div className="payroll-stat-card">
                        <span className="payroll-stat-label">Statutory Deductions</span>
                        <span className="payroll-stat-val" style={{ color: '#f87171' }}>- ₹{totalDeductions.toLocaleString()}</span>
                      </div>
                      <div className="payroll-stat-card">
                        <span className="payroll-stat-label">Disbursed Records</span>
                        <span className="payroll-stat-val">{disbursedCount} / {filtered.length}</span>
                      </div>
                    </div>

                    <div className="table-wrapper">
                      <table className="enterprise-table">
                        <thead>
                          <tr>
                            <th>PERSONNEL / ROLE</th>
                            <th>BASE WAGE</th>
                            <th>ALLOWANCES</th>
                            <th>DEDUCTIONS</th>
                            <th>NET PAYABLE</th>
                            <th>STATUS</th>
                            <th>DISBURSEMENT AUDIT</th>
                            <th>ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr>
                              <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                                No payroll ledger entries found for period {payrollPeriod}. Click "Generate Draft Batch" to initialize from personnel roster.
                              </td>
                            </tr>
                          ) : (
                            filtered.map(ledger => (
                              <tr key={ledger.id}>
                                <td>
                                  <div className="personnel-profile">
                                    <div className="avatar-circle">
                                      {ledger.employee?.fullName ? ledger.employee.fullName.charAt(0) : 'E'}
                                    </div>
                                    <div>
                                      <div className="person-name">{ledger.employee?.fullName || 'Employee'}</div>
                                      <div className="person-email">{ledger.employee?.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="salary-val">₹{ledger.baseSalary?.toLocaleString()}</div>
                                </td>
                                <td>
                                  <span style={{ color: '#34d399', fontWeight: '600' }}>+ ₹{ledger.allowances?.toLocaleString()}</span>
                                </td>
                                <td>
                                  <span style={{ color: '#f87171', fontWeight: '600' }}>- ₹{ledger.deductions?.toLocaleString()}</span>
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#F5C542', fontFamily: 'monospace' }}>
                                    ₹{ledger.netSalary?.toLocaleString()}
                                  </div>
                                </td>
                                <td>
                                  <span className={`payroll-badge ${ledger.status?.toLowerCase()}`}>
                                    {ledger.status}
                                  </span>
                                </td>
                                <td>
                                  {ledger.disbursement ? (
                                    <div style={{ fontSize: '0.78rem' }}>
                                      <div style={{ color: '#34d399', fontWeight: '700' }}>{ledger.disbursement.transactionId}</div>
                                      <div style={{ color: '#64748b' }}>{ledger.disbursement.method} • {new Date(ledger.disbursement.disbursedAt).toLocaleDateString()}</div>
                                    </div>
                                  ) : (
                                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Pending Release</span>
                                  )}
                                </td>
                                <td>
                                  <div className="actions-cell">
                                    {ledger.status === 'DRAFT' && (
                                      <>
                                        <button 
                                          className="payroll-action-btn"
                                          onClick={() => {
                                            setTargetAdjustLedger(ledger);
                                            setAdjustAllowances(ledger.allowances || 0);
                                            setAdjustDeductions(ledger.deductions || 0);
                                            setShowAdjustModal(true);
                                          }}
                                          title="Modify allowances and deductions"
                                        >
                                          <Sliders size={13} />
                                          <span>Adjust</span>
                                        </button>
                                        <button 
                                          className="btn-approve-clear"
                                          onClick={() => handleApprovePayroll(ledger.id)}
                                          title="Approve ledger for disbursement"
                                        >
                                          <Check size={13} />
                                          <span>Approve</span>
                                        </button>
                                      </>
                                    )}

                                    {ledger.status === 'APPROVED' && (
                                      <>
                                        <button 
                                          className="payroll-action-btn"
                                          onClick={() => {
                                            setTargetAdjustLedger(ledger);
                                            setAdjustAllowances(ledger.allowances || 0);
                                            setAdjustDeductions(ledger.deductions || 0);
                                            setShowAdjustModal(true);
                                          }}
                                          title="Modify allowances and deductions"
                                        >
                                          <Sliders size={13} />
                                          <span>Adjust</span>
                                        </button>
                                        <button 
                                          className="btn-approve-clear"
                                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                                          onClick={() => {
                                            setTargetDisburseLedger(ledger);
                                            setDisburseTxnId(`TXN-${Date.now().toString().slice(-6)}-NEFT`);
                                            setShowDisburseModal(true);
                                          }}
                                          title="Execute disbursement payout"
                                        >
                                          <CreditCard size={13} />
                                          <span>Disburse</span>
                                        </button>
                                      </>
                                    )}

                                    {ledger.status === 'DISBURSED' && (
                                      <span style={{ color: '#34d399', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={14} /> Settled
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 4: WORKSPACE ORCHESTRATOR */}
          {activeTab === 'workspaces' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="view-header">
                <div>
                  <h2>WORKSPACE ORCHESTRATOR</h2>
                  <p>Organize agents, creator talent pools, and streaming parameters into collaborative clusters.</p>
                </div>
                <button 
                  className="primary-action-btn"
                  onClick={() => setShowAddWorkspaceModal(true)}
                >
                  <Plus size={16} />
                  <span>Create Workspace</span>
                </button>
              </div>

              <div className="workspaces-grid">
                {workspaces.map(ws => (
                  <div key={ws.id} className="workspace-cluster-card">
                    <div className="cluster-card-header">
                      <h3>{ws.name}</h3>
                      <span className="cluster-lead-badge">
                        Agent: {ws.assignedAgent ? ws.assignedAgent.fullName : 'Unassigned'}
                      </span>
                    </div>
                    <p className="cluster-desc">{ws.description || 'Enterprise collaborative streaming and growth cluster.'}</p>
                    
                    <div className="cluster-stats-grid">
                      <div className="cluster-stat-item">
                        <span className="stat-num">{ws.streamersCount || ws.members?.filter(m => m.user?.role === 'CREATOR').length || 0}</span>
                        <span className="stat-label">Active Streamers</span>
                      </div>
                      <div className="cluster-stat-item">
                        <span className="stat-num">{ws.leadPipelineCount || 0}</span>
                        <span className="stat-label">Leads In Queue</span>
                      </div>
                      <div className="cluster-stat-item">
                        <span className="stat-num">{ws.openTasksCount || 0}</span>
                        <span className="stat-label">Active Tasks</span>
                      </div>
                    </div>

                    <div className="cluster-card-footer">
                      <button 
                        className="enter-cluster-btn"
                        onClick={() => navigate('/workspace-portal')}
                      >
                        <span>Open In Workspace Portal</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: B2B SPONSORSHIPS ESCROW (v6.0 Wireframe A) */}
          {activeTab === 'sponsorships' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <SponsorshipCampaigns />
            </motion.div>
          )}

          {/* TAB: MULTI-TENANT FRANCHISE & GUILDS (v6.0) */}
          {activeTab === 'franchise' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FranchiseGuildManager />
            </motion.div>
          )}

          {/* TAB 5: LEAD HUB (SCORED) */}
          {activeTab === 'leads' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="view-header">
                <div>
                  <h2>HIGH-VELOCITY LEAD HUB (PREDICTIVE SCORING)</h2>
                  <p>Inbound creator applications scored automatically by reach and routed to active staff.</p>
                </div>
                <button className="refresh-btn" onClick={fetchData}>
                  <RefreshCw size={15} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Wireframe D: Intelligent Workload Router Status Banner */}
              <div className={`lead-router-status-banner ${leadQueue.length > 0 ? 'overloaded' : ''}`}>
                <div className="router-status-title-wrap">
                  <span className={`router-state-badge ${leadQueue.length > 0 ? 'capacity' : 'normal'}`}>
                    <Zap size={14} />
                    {leadQueue.length > 0 ? 'CAPACITY LIMIT REACHED' : 'ROUTER ACTIVE (NORMAL)'}
                  </span>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Agent Workload Ceiling: <strong>10 Leads/Agent</strong> • Active Queue Hold: <strong>{leadQueue.length} Candidates</strong>
                  </div>
                </div>

                <div className="queue-action-buttons">
                  <button 
                    className="queue-btn-redistribute"
                    onClick={handleForceRedistribute}
                    disabled={redistributingQueue}
                    title="Attempt automatic redistribution of all queued leads across eligible active agents"
                  >
                    <RefreshCw size={13} className={redistributingQueue ? 'spinning' : ''} />
                    <span>{redistributingQueue ? 'Redistributing...' : 'Force Batch Redistribution'}</span>
                  </button>
                  <button 
                    className="queue-btn-offline"
                    onClick={handleRerouteOffline}
                    title="Identify offline personnel and pull their unserviced leads into redistribution"
                  >
                    <AlertTriangle size={13} />
                    <span>Reroute Offline Agents</span>
                  </button>
                </div>
              </div>

              {queueActionMsg && (
                <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)', color: '#F5C542', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} />
                  <span>{queueActionMsg}</span>
                </div>
              )}

              {/* Fail-Safe Hold Queue Table (Section 9.4 & Section 5) */}
              {leadQueue.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Clock size={16} style={{ color: '#fbbf24' }} />
                    <h3 style={{ fontSize: '0.92rem', fontWeight: '800', letterSpacing: '1px', color: '#fbbf24', textTransform: 'uppercase', margin: 0 }}>
                      Fail-Safe Hold Queue ({leadQueue.length} Leads • 3-Hour TTL)
                    </h3>
                  </div>

                  <div className="table-wrapper" style={{ border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>CANDIDATE</th>
                          <th>PLATFORM</th>
                          <th>ATTEMPTED ROUTING</th>
                          <th>ENQUEUED AT</th>
                          <th>HOLD EXPIRATION</th>
                          <th>TRIGGER REASON</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadQueue.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div className="lead-name">{item.lead?.fullName || 'Anonymous Candidate'}</div>
                              <div className="lead-email">{item.lead?.email}</div>
                            </td>
                            <td>
                              <span className="platform-tag">{item.lead?.platform || 'Multi'}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                {item.attemptedAgent ? item.attemptedAgent.fullName : 'Exhausted All Staff'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {new Date(item.enqueuedAt).toLocaleTimeString()}
                              </span>
                            </td>
                            <td>
                              <span className="hold-time-pill">
                                <Clock size={12} />
                                {formatTimeRemaining(item.expiresAt)}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.76rem', color: '#f87171' }}>
                                {item.reason || 'Agent workload cap exceeded'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="queue-btn-redistribute"
                                style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                onClick={handleForceRedistribute}
                              >
                                Reroute
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="table-wrapper">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>APPLICANT</th>
                      <th>PLATFORM</th>
                      <th>FOLLOWERS</th>
                      <th>PREDICTIVE SCORE</th>
                      <th>ASSIGNED AGENT</th>
                      <th>STATUS</th>
                      <th>NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => {
                      const scoreColor = lead.score >= 90 ? 'score-high' : lead.score >= 70 ? 'score-mid' : 'score-low';
                      return (
                        <tr key={lead.id}>
                          <td>
                            <div>
                              <div className="lead-name">{lead.fullName}</div>
                              <div className="lead-email">{lead.email}</div>
                              {lead.whatsapp && <div className="lead-contact">{lead.whatsapp}</div>}
                            </div>
                          </td>
                          <td>
                            <span className="platform-tag">{lead.platform || 'Multi'}</span>
                          </td>
                          <td>
                            <span className="followers-val">{lead.followers ? `${(lead.followers / 1000).toFixed(0)}K` : 'Growing'}</span>
                          </td>
                          <td>
                            <span className={`score-badge ${scoreColor}`}>
                              {lead.score} / 100
                            </span>
                          </td>
                          <td>
                            <select 
                              className="agent-override-select"
                              value={lead.agentId || ''}
                              onChange={(e) => handleUpdateLead(lead.id, { agentId: e.target.value })}
                            >
                              <option value="">Unassigned</option>
                              {allUsers.filter(u => u.role === 'EMPLOYEE').map(p => (
                                <option key={p.id} value={p.id}>{p.fullName}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select 
                              className={`status-select status-${lead.status.toLowerCase()}`}
                              value={lead.status}
                              onChange={(e) => handleUpdateLead(lead.id, { status: e.target.value })}
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="INTERVIEWED">INTERVIEWED</option>
                              <option value="SIGNED">SIGNED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                          <td>
                            <div className="notes-preview" title={lead.notes}>
                              {lead.notes || 'No notes added.'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 6: LIVE TELEMETRY */}
          {activeTab === 'telemetry' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="view-header">
                <div>
                  <h2>REAL-TIME OPERATIONAL TELEMETRY FEED</h2>
                  <p>Real-time audit stream broadcasting Socket.IO state transitions, task progression, and agent actions.</p>
                </div>
                <div className="live-radar-badge">
                  <span className="radar-blip" />
                  <span>LISTENING ON SOCKET GATEWAY</span>
                </div>
              </div>

              <div className="telemetry-feed-container">
                {telemetryLogs.length === 0 ? (
                  <div className="empty-telemetry">
                    <Activity size={32} />
                    <p>Waiting for incoming Socket.IO events... (Move a task, submit a worklog, or activate an account to see live stream)</p>
                  </div>
                ) : (
                  telemetryLogs.map((log, index) => (
                    <div key={index} className="telemetry-event-row">
                      <span className="telemetry-time">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`telemetry-type ${log.type?.toLowerCase()}`}>
                        {log.type}
                      </span>
                      <span className="telemetry-msg">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 7: MEDIA SHOWCASE */}
          {activeTab === 'showcase' && (
            <motion.div 
              className="tab-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="view-header">
                <div>
                  <h2>MEDIA & SHOWCASE MANAGEMENT</h2>
                  <p>Configure homepage platform video showcase and creator highlights.</p>
                </div>
              </div>

              <div className="showcase-card-panel">
                <h3>Update Featured YouTube Showcase</h3>
                <form onSubmit={handleSaveVideo} className="showcase-form">
                  <div className="form-group">
                    <label>YouTube Video URL</label>
                    <input 
                      type="url" 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={featuredUrl}
                      onChange={(e) => setFeaturedUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Video Showcase Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Elvooriq Agency Showcase 2026" 
                      value={featuredTitle}
                      onChange={(e) => setFeaturedTitle(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="primary-action-btn">
                    <span>Deploy to Landing Page</span>
                  </button>
                </form>

                <div className="active-videos-list">
                  <h4>Currently Deployed Showcase Videos ({featuredVideos.length})</h4>
                  {featuredVideos.map(v => (
                    <div key={v.id} className="video-item-card">
                      <Video size={18} />
                      <div className="video-info">
                        <div className="video-title">{v.title || 'Platform Showcase'}</div>
                        <a href={v.youtubeUrl} target="_blank" rel="noreferrer" className="video-link">
                          {v.youtubeUrl} <ExternalLink size={12} />
                        </a>
                      </div>
                      <span className="active-status-badge">ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              TAB: PLATFORM COMMISSION STATEMENT INGESTION (Wireframe C)
             ========================================================================= */}
          {activeTab === 'commissions' && (
            <motion.div 
              className="tab-content commission-hub-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="section-header-row">
                <div>
                  <h2>Platform Commission Statement Ingestion Hub</h2>
                  <p>Parse multi-currency platform payout CSV reports, execute atomic 70/30 commission splits, and route employee bonuses.</p>
                </div>
                <button 
                  className="primary-action-btn"
                  onClick={fetchCommissionSplits}
                >
                  <RefreshCw size={15} />
                  <span>Refresh Ledger</span>
                </button>
              </div>

              {splitSyncNotice && (
                <div style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)', color: '#F5C542', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  ✓ {splitSyncNotice}
                </div>
              )}

              {/* Summary KPIs */}
              <div className="commission-metrics-ribbon">
                <div className="commission-stat-card">
                  <span className="commission-stat-label">Total Platform Revenue</span>
                  <span className="commission-stat-value highlight">${(splitAnalytics.totalGross || 0).toLocaleString()}</span>
                </div>
                <div className="commission-stat-card">
                  <span className="commission-stat-label">Agency Commission (30%)</span>
                  <span className="commission-stat-value">${(splitAnalytics.totalAgencyCut || 0).toLocaleString()}</span>
                </div>
                <div className="commission-stat-card">
                  <span className="commission-stat-label">Agent Bonuses Routed (5%)</span>
                  <span className="commission-stat-value" style={{ color: '#60a5fa' }}>${(splitAnalytics.totalAgentBonuses || 0).toLocaleString()}</span>
                </div>
                <div className="commission-stat-card">
                  <span className="commission-stat-label">Unsynced Splits</span>
                  <span className="commission-stat-value" style={{ color: splitAnalytics.unsyncedCount > 0 ? '#fbbf24' : '#94a3b8' }}>
                    {splitAnalytics.unsyncedCount || 0}
                  </span>
                </div>
              </div>

              {/* Statement Ingestion Card */}
              <div className="commission-ingest-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                    Ingest Monthly Platform Statement (CSV)
                  </h3>
                  <button 
                    type="button" 
                    onClick={handleGenerateSampleCSV}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#F5C542', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📄 Attach Sample Platform Statement CSV
                  </button>
                </div>

                <form onSubmit={handleUploadCommissionCSV} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="commission-form-grid">
                    <div className="form-group">
                      <label>Target Billing Cycle</label>
                      <input 
                        type="text" 
                        value={splitBillingCycle} 
                        onChange={(e) => setSplitBillingCycle(e.target.value)}
                        placeholder="e.g. September-2026"
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Default Agency Cut (%)</label>
                      <input 
                        type="number" 
                        step="0.5"
                        min="0"
                        max="100"
                        value={splitCommissionRate} 
                        onChange={(e) => setSplitCommissionRate(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div 
                    className="commission-dropzone"
                    onClick={() => document.getElementById('splitCsvInput').click()}
                  >
                    <UploadCloud size={32} style={{ color: '#D4AF37' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
                      {splitCsvFile ? `Selected: ${splitCsvFile.name} (${(splitCsvFile.size / 1024).toFixed(1)} KB)` : 'Click to Browse Platform Statement CSV or Drag & Drop'}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Expected Columns: CreatorPlatformId, PlatformName, GrossRevenueUSD
                    </span>
                    <input 
                      id="splitCsvInput"
                      type="file" 
                      accept=".csv,text/csv" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSplitCsvFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <button 
                      type="submit" 
                      className="commission-run-btn"
                      disabled={parsingSplits || !splitCsvFile}
                    >
                      <Zap size={14} />
                      {parsingSplits ? 'Processing Statement Engine...' : 'Run Split Statement Engine'}
                    </button>
                  </div>
                </form>

                {/* Ingest Execution Result Banner */}
                {splitIngestResult && (
                  <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #2A2520', boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#4ADE80', marginBottom: '6px' }}>
                      ✓ {splitIngestResult.message}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Splits Processed: <strong style={{ color: '#f1f5f9' }}>{splitIngestResult.splitsProcessedCount}</strong> • Skipped Records: <strong style={{ color: '#fbbf24' }}>{splitIngestResult.skippedCount}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Splits Ledger Table */}
              <div className="table-card-panel">
                <div className="table-header-block">
                  <h3>Extracted Commission Splits Ledger ({splitsList.length})</h3>
                  <span className="table-subtitle">Granular platform disbursements, agency retention, and employee bonuses.</span>
                </div>

                <div className="table-wrapper">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>CREATOR NAME / PLATFORM</th>
                        <th>BILLING CYCLE</th>
                        <th>GROSS REVENUE</th>
                        <th>AGENCY CUT (30%)</th>
                        <th>CREATOR SHARE (70%)</th>
                        <th>AGENT BONUS (5%)</th>
                        <th>PAYROLL SYNC STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {splitsList.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                            No commission statement splits on file. Upload a platform payout CSV above.
                          </td>
                        </tr>
                      ) : (
                        splitsList.map((s) => (
                          <tr key={s.id}>
                            <td>
                              <div style={{ fontWeight: 800, color: '#f8fafc' }}>
                                {s.user?.fullName || 'Creator'}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                {s.platform} • ID: {s.user?.platformId || s.userId.slice(0, 8)}
                              </span>
                            </td>
                            <td>{s.billingCycle}</td>
                            <td style={{ fontWeight: 800, color: '#f1f5f9' }}>
                              ${(s.grossRevenue || 0).toLocaleString()}
                            </td>
                            <td style={{ color: '#F5C542', fontWeight: 700 }}>
                              ${(s.agencyCut || 0).toLocaleString()}
                            </td>
                            <td style={{ color: '#34d399', fontWeight: 700 }}>
                              ${(s.creatorCut || 0).toLocaleString()}
                            </td>
                            <td style={{ color: '#60a5fa', fontWeight: 700 }}>
                              ${(s.agentBonus || 0).toLocaleString()}
                            </td>
                            <td>
                              <span className={`sync-status-pill ${s.isSyncedToPay ? 'synced' : 'pending'}`}>
                                {s.isSyncedToPay ? '✓ SYNCED' : '⏱ UNCONFIRMED'}
                              </span>
                            </td>
                            <td>
                              {!s.isSyncedToPay && (
                                <button 
                                  className="sync-action-btn"
                                  onClick={() => handleSyncSplitToPayroll(s.id)}
                                >
                                  Sync Payroll
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Modal: Add Personnel */}
      {showAddEmployeeModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Onboard New Agency Personnel</h3>
            <form onSubmit={handleCreateEmployee}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={newEmployee.fullName} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Work Email</label>
                <input 
                  type="email" 
                  value={newEmployee.email} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Talent Manager"
                  value={newEmployee.jobTitle} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select 
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                >
                  <option value="TALENT_MANAGEMENT">TALENT MANAGEMENT</option>
                  <option value="CREATOR_EXPANSION">CREATOR EXPANSION</option>
                  <option value="EXECUTIVE_OPS">EXECUTIVE OPERATIONS</option>
                  <option value="BRAND_DEALS">BRAND PARTNERSHIPS</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Salary (INR ₹)</label>
                <input 
                  type="number" 
                  value={newEmployee.baseSalary} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, baseSalary: e.target.value })}
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddEmployeeModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Confirm Personnel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Workspace */}
      {showAddWorkspaceModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Create Team Workspace Cluster</h3>
            <form onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label>Workspace Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Workspace Gamma (Esports & High Velocity)"
                  value={newWorkspace.name} 
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Operational Description</label>
                <textarea 
                  placeholder="Describe the focus of this cluster..."
                  value={newWorkspace.description} 
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Assigned Lead Agent</label>
                <select 
                  value={newWorkspace.agentId}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, agentId: e.target.value })}
                >
                  <option value="">Select an Agent...</option>
                  {allUsers.filter(u => u.role === 'EMPLOYEE').map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.role})</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddWorkspaceModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Launch Workspace</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Allowances & Deductions (v4.0 Wireframe B) */}
      {showAdjustModal && targetAdjustLedger && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Adjust Allowances & Deductions</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginBottom: '16px' }}>
              Modifying compensation for <strong>{targetAdjustLedger.employee?.fullName}</strong> ({targetAdjustLedger.period})
            </p>
            <form onSubmit={handleCommitAdjustment}>
              <div className="form-group">
                <label>Base Salary (Fixed Reference)</label>
                <input 
                  type="text" 
                  value={`₹${targetAdjustLedger.baseSalary?.toLocaleString()}`} 
                  disabled 
                  style={{ opacity: 0.6 }}
                />
              </div>
              <div className="form-group">
                <label>Incentives / Allowances (₹)</label>
                <input 
                  type="number" 
                  value={adjustAllowances} 
                  onChange={(e) => setAdjustAllowances(e.target.value)} 
                  min="0"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Statutory / Tax Deductions (₹)</label>
                <input 
                  type="number" 
                  value={adjustDeductions} 
                  onChange={(e) => setAdjustDeductions(e.target.value)} 
                  min="0"
                  required 
                />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', letterSpacing: '0.5px' }}>CALCULATED NET PAYABLE:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#F5C542', fontFamily: 'monospace', marginTop: '4px' }}>
                  ₹{(Math.max(0, Number(targetAdjustLedger.baseSalary) + Number(adjustAllowances) - Number(adjustDeductions))).toLocaleString()}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Commit Adjustments</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Execute Financial Disbursement (v4.0 Wireframe B) */}
      {showDisburseModal && targetDisburseLedger && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Execute Financial Disbursement</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginBottom: '16px' }}>
              Disbursing <strong>₹{targetDisburseLedger.netSalary?.toLocaleString()}</strong> to <strong>{targetDisburseLedger.employee?.fullName}</strong> ({targetDisburseLedger.period})
            </p>
            <form onSubmit={handleCommitDisbursement}>
              <div className="form-group">
                <label>Disbursement Rail / Method</label>
                <select 
                  value={disburseMethod} 
                  onChange={(e) => setDisburseMethod(e.target.value)}
                >
                  <option value="NEFT_IMPS">NEFT / IMPS Electronic Clearing</option>
                  <option value="UPI">Unified Payments Interface (UPI)</option>
                  <option value="WIRE">Corporate Direct Wire</option>
                  <option value="BANK_TRANSFER">Direct Account Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bank Clearing Transaction ID / Reference</label>
                <input 
                  type="text" 
                  placeholder="e.g. TXN-2026-NEFT-981249"
                  value={disburseTxnId} 
                  onChange={(e) => setDisburseTxnId(e.target.value)} 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowDisburseModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>Confirm & Seal Disbursement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Profile Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="delete-modal-backdrop" onClick={() => !isDeletingUser && setUserToDelete(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="delete-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-modal-header">
                <div className="delete-warning-icon-box">
                  <Trash2 size={22} color="#f43f5e" />
                </div>
                <div>
                  <h3 className="delete-modal-title">Delete User Profile</h3>
                  <p className="delete-modal-subtitle">Permanent removal of user profile and associated records</p>
                </div>
              </div>

              <div className="delete-modal-body">
                <div className="delete-target-info">
                  <div className="delete-info-row">
                    <span className="info-label">Full Name:</span>
                    <span className="info-value">{userToDelete.fullName || 'Unnamed User'}</span>
                  </div>
                  <div className="delete-info-row">
                    <span className="info-label">Email Address:</span>
                    <span className="info-value">{userToDelete.email}</span>
                  </div>
                  <div className="delete-info-row">
                    <span className="info-label">System Role:</span>
                    <span className="info-value role-badge">{userToDelete.role}</span>
                  </div>
                  <div className="delete-info-row">
                    <span className="info-label">Account Status:</span>
                    <span className="info-value">{userToDelete.status}</span>
                  </div>
                </div>

                <div className="delete-warning-banner">
                  <AlertTriangle size={18} className="warn-icon" />
                  <div>
                    <strong>Irreversible Database Action:</strong>
                    <p>Deleting this profile will permanently remove all assigned tasks, daily work logs, offer letters, and compliance documentation from the database.</p>
                  </div>
                </div>
              </div>

              <div className="delete-modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel-delete" 
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeletingUser}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-confirm-delete"
                  onClick={handleConfirmDeleteUser}
                  disabled={isDeletingUser}
                >
                  <Trash2 size={15} />
                  <span>{isDeletingUser ? 'Purging Profile...' : 'Confirm Permanent Deletion'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HRAdminPanel;
