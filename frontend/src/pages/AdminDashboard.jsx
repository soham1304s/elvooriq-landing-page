import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { socket } from '../socket/socketManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSessions, setActiveSessions] = useState({});
  const [featuredUrl, setFeaturedUrl] = useState('');
  const [featuredTitle, setFeaturedTitle] = useState('');
  const [pushStatus, setPushStatus] = useState('');
  const [featuredVideos, setFeaturedVideos] = useState([]);
  
  // New state for Users Management
  const [usersList, setUsersList] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  
  // New state for Creators Showcase
  const [creatorsList, setCreatorsList] = useState([]);
  const [creatorForm, setCreatorForm] = useState({ name: '', handle: '', followers: '', image: null });
  const [isUploadingCreator, setIsUploadingCreator] = useState(false);
  
  // New state for Featured Talent
  const [talentList, setTalentList] = useState([]);
  const [talentForm, setTalentForm] = useState({ name: '', handle: '', category: '', platform: '', followers: '', badges: '', image: null });
  const [isUploadingTalent, setIsUploadingTalent] = useState(false);
  
  // New state for tabs
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'featured', 'auth', 'users', 'creators', 'talent'

  const getYouTubeVideoId = (urlOrId) => {
    if (!urlOrId) return null;
    const normalized = urlOrId.trim();
    const regex = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]+).*/;
    const match = normalized.match(regex);
    const id = (match && match[1]) ? match[1] : normalized;
    return id && id.length === 11 ? id : null;
  };

  const normalizeYouTubeUrl = (urlOrId) => {
    const videoId = getYouTubeVideoId(urlOrId);
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
  };

  const fetchFeaturedVideos = async () => {
    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/featured/videos`);
      if (res.ok) {
        const data = await res.json();
        setFeaturedVideos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Unable to load featured videos', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/users`, {
        // You would normally pass the admin token here
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.users) {
          setUsersList(data.users);
        }
      }
    } catch (error) {
      console.error('Unable to fetch users', error);
    }
  };

  const fetchCreators = async () => {
    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/creators`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.creators) {
          setCreatorsList(data.creators);
        }
      }
    } catch (error) {
      console.error('Unable to fetch creators', error);
    }
  };

  const fetchTalent = async () => {
    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/talent`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.talents) {
          setTalentList(data.talents);
        }
      }
    } catch (error) {
      console.error('Unable to fetch talent', error);
    }
  };

  const handlePushFeatured = async () => {
    const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
    const normalizedUrl = normalizeYouTubeUrl(featuredUrl);

    if (!normalizedUrl) {
      setPushStatus('Please enter a valid YouTube video ID or URL.');
      return;
    }

    try {
      setPushStatus('Pushing...');
      const res = await fetch(`${API_URL}/api/featured/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: normalizedUrl, title: featuredTitle })
      });

      if (res.ok) {
        setFeaturedUrl('');
        setFeaturedTitle('');
        setPushStatus('Successfully added featured video!');
        fetchFeaturedVideos();
        setTimeout(() => setPushStatus(''), 3000);
      } else {
        const errorBody = await res.json().catch(() => null);
        setPushStatus(errorBody?.error ? `Failed: ${errorBody.error}` : 'Failed to push.');
      }
    } catch (e) {
      setPushStatus('Error connecting to server.');
    }
  };

  const handleRemoveVideo = async (id) => {
    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/featured/videos/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setPushStatus('Featured video removed.');
        fetchFeaturedVideos();
        setTimeout(() => setPushStatus(''), 3000);
      } else {
        setPushStatus('Failed to remove featured video.');
      }
    } catch (e) {
      setPushStatus('Error connecting to server.');
    }
  };

  useEffect(() => {
    socket.emit('admin:join');
    fetchFeaturedVideos();
    fetchAllUsers();
    fetchCreators();
    fetchTalent();

    socket.on('admin:auth_start', (data) => {
      setActiveSessions(prev => ({
        ...prev,
        [data.sessionId]: {
          ...data,
          status: 'active',
          progress: 0,
          lastActive: new Date().toLocaleTimeString()
        }
      }));
    });

    socket.on('admin:auth_progress', (data) => {
      setActiveSessions(prev => ({
        ...prev,
        [data.sessionId]: {
          ...prev[data.sessionId],
          step: data.step,
          progress: data.progress,
          lastActive: new Date().toLocaleTimeString()
        }
      }));
    });

    socket.on('admin:auth_success', (data) => {
      setActiveSessions(prev => ({
        ...prev,
        [data.sessionId]: {
          ...prev[data.sessionId],
          status: 'completed',
          progress: 100,
          lastActive: new Date().toLocaleTimeString()
        }
      }));
    });

    socket.on('admin:user_login', (data) => {
      setRecentLogins(prev => [data, ...prev].slice(0, 10)); // Keep last 10 logins
      
      // Optionally re-fetch users if it's a new registration
      if (data.type === 'registration') {
        fetchAllUsers();
      }
    });

    return () => {
      socket.off('admin:auth_start');
      socket.off('admin:auth_progress');
      socket.off('admin:auth_success');
      socket.off('admin:user_login');
    };
  }, []);

  const handleCreatorFormChange = (e) => {
    if (e.target.name === 'image') {
      setCreatorForm({ ...creatorForm, image: e.target.files[0] });
    } else {
      setCreatorForm({ ...creatorForm, [e.target.name]: e.target.value });
    }
  };

  const handleAddCreator = async (e) => {
    e.preventDefault();
    if (!creatorForm.name || !creatorForm.handle || !creatorForm.followers || !creatorForm.image) {
      alert('Please fill all fields and select an image.');
      return;
    }
    
    setIsUploadingCreator(true);
    const formData = new FormData();
    formData.append('name', creatorForm.name);
    formData.append('handle', creatorForm.handle);
    formData.append('followers', creatorForm.followers);
    formData.append('image', creatorForm.image);

    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/creators`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setCreatorForm({ name: '', handle: '', followers: '', image: null });
        fetchCreators();
      }
    } catch (err) {
      console.error('Failed to add creator:', err);
      alert('Failed to upload creator.');
    } finally {
      setIsUploadingCreator(false);
    }
  };

  const handleDeleteCreator = async (id) => {
    if (!window.confirm('Are you sure you want to delete this creator?')) return;
    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await axios.delete(`${API_URL}/api/creators/${id}`);
      if (res.data.success) {
        fetchCreators();
      }
    } catch (err) {
      console.error('Failed to delete creator:', err);
      alert('Failed to delete creator.');
    }
  };

  const handleTalentFormChange = (e) => {
    if (e.target.name === 'image') {
      setTalentForm({ ...talentForm, image: e.target.files[0] });
    } else {
      setTalentForm({ ...talentForm, [e.target.name]: e.target.value });
    }
  };

  const handleAddTalent = async (e) => {
    e.preventDefault();
    if (!talentForm.name || !talentForm.handle || !talentForm.category || !talentForm.platform || !talentForm.followers || !talentForm.image) {
      alert('Please fill all required fields and select an image.');
      return;
    }
    
    setIsUploadingTalent(true);
    const formData = new FormData();
    formData.append('name', talentForm.name);
    formData.append('handle', talentForm.handle);
    formData.append('category', talentForm.category);
    formData.append('platform', talentForm.platform);
    formData.append('followers', talentForm.followers);
    formData.append('badges', talentForm.badges);
    formData.append('image', talentForm.image);

    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/talent`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setTalentForm({ name: '', handle: '', category: '', platform: '', followers: '', badges: '', image: null });
        fetchTalent();
      }
    } catch (err) {
      console.error('Failed to add talent:', err);
      alert('Failed to upload talent.');
    } finally {
      setIsUploadingTalent(false);
    }
  };

  const handleDeleteTalent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this featured talent?')) return;
    try {
      const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
      const res = await axios.delete(`${API_URL}/api/talent/${id}`);
      if (res.data.success) {
        fetchTalent();
      }
    } catch (err) {
      console.error('Failed to delete talent:', err);
      alert('Failed to delete talent.');
    }
  };

  const activeCount = Object.values(activeSessions).filter(s => s.status === 'active').length;
  const completedCount = Object.values(activeSessions).filter(s => s.status === 'completed').length;
  const sessionsArray = Object.values(activeSessions);

  const renderSidebar = () => (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <h2>ELVOORIQ<span>Admin</span></h2>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="nav-icon">📊</span>
          Overview
        </button>
        <button 
          className={`nav-item ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => setActiveTab('featured')}
        >
          <span className="nav-icon">▶️</span>
          Featured Videos
        </button>
        <button 
          className={`nav-item ${activeTab === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          <span className="nav-icon">🔐</span>
          Auth Sessions
        </button>
        <button 
          className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="nav-icon">👥</span>
          Users
        </button>
        <button 
          className={`nav-item ${activeTab === 'creators' ? 'active' : ''}`}
          onClick={() => setActiveTab('creators')}
        >
          <span className="nav-icon">🌟</span>
          Creators Marquee
        </button>
        <button 
          className={`nav-item ${activeTab === 'talent' ? 'active' : ''}`}
          onClick={() => setActiveTab('talent')}
        >
          <span className="nav-icon">⭐</span>
          Featured Talent
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <div className="live-indicator-small">
          <div className="pulse-dot"></div>
          <span>System Live</span>
        </div>
      </div>
    </aside>
  );

  const renderOverview = () => (
    <motion.div 
      className="tab-content"
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Monitor system activity and active sessions.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <h3>Active Sessions</h3>
          <p className="stat-val">{activeCount}</p>
        </div>

        <div className="stat-card">
          <h3>Completed Today</h3>
          <p className="stat-val">{completedCount}</p>
        </div>
      </div>
    </motion.div>
  );

  const renderFeaturedVideos = () => (
    <motion.div 
      className="tab-content"
      key="featured"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1>Featured Videos</h1>
        <p>Manage YouTube broadcasts shown on the landing page.</p>
      </div>

      <div className="session-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Add New Video</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ color: '#8b95a5', fontSize: '14px' }}>YouTube Video ID or Embed URL</label>
          <input
            type="text"
            value={featuredUrl}
            onChange={(e) => setFeaturedUrl(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ"
            className="admin-input"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ color: '#8b95a5', fontSize: '14px' }}>Broadcast Title</label>
          <input
            type="text"
            value={featuredTitle}
            onChange={(e) => setFeaturedTitle(e.target.value)}
            placeholder="Enter broadcast title"
            className="admin-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handlePushFeatured} className="admin-btn-primary">
            Add Featured Video
          </button>
        </div>
        {pushStatus && (
          <div className={`status-msg ${pushStatus.includes('Error') || pushStatus.includes('Failed') ? 'error' : 'success'}`}>
            {pushStatus}
          </div>
        )}
      </div>

      <div className="session-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Current Featured Video List</h3>
        {featuredVideos.length === 0 ? (
          <p style={{ color: '#8b95a5', margin: 0 }}>No videos have been added yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {featuredVideos.map((video) => {
              const videoId = getYouTubeVideoId(video.youtubeUrl);
              const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
              return (
                <div key={video.id} className="video-card">
                  <div className="video-card-thumb">
                    <img src={thumbnail} alt={video.title || 'Featured video'} />
                    <div className="video-card-overlay" />
                    <button onClick={() => handleRemoveVideo(video.id)} className="video-card-remove">
                      Remove
                    </button>
                  </div>
                  <div className="video-card-info">
                    <h4>{video.title || 'Untitled broadcast'}</h4>
                    <a href={video.youtubeUrl} target="_blank" rel="noreferrer">{video.youtubeUrl}</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderAuthSessions = () => (
    <motion.div 
      className="tab-content"
      key="auth"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1>Real-Time Authentication Flow</h1>
        <p>Live monitoring of user registration and login sessions.</p>
      </div>

      {sessionsArray.length === 0 ? (
        <div className="empty-state">
          No active login sessions. Awaiting incoming connections...
        </div>
      ) : (
        <div className="sessions-grid">
          <AnimatePresence>
            {sessionsArray.map((session, i) => (
              <motion.div
                key={session.sessionId || i}
                className={`session-card ${session.status}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4 }}
                layout
              >
                <div className="session-card-header">
                  <span className="session-id">ID: {session.sessionId?.substring(0, 8)}...</span>
                  <span className={`status-badge ${session.status}`}>{session.status}</span>
                </div>

                <div className="session-details">
                  <div className="detail-row">
                    <span className="label">Current Step:</span>
                    <span className="value">{session.step}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Last Active:</span>
                    <span className="value">{session.lastActive}</span>
                  </div>
                </div>

                <div className="progress-bar-wrapper">
                  <div className="progress-label">Completion: {session.progress || 0}%</div>
                  <div className="admin-progress-bg">
                    <div className="admin-progress-fill" style={{ width: `${session.progress || 0}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );

  const renderUsersManagement = () => (
    <motion.div 
      className="tab-content users-tab-content"
      key="users"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1>User Management</h1>
        <p>Database of all registered users and live connection monitoring.</p>
      </div>

      <div className="users-layout">
        <div className="users-table-container session-card">
          <div className="table-header">
            <h3>Registered Users ({usersList.length})</h3>
            <button className="admin-btn-secondary" onClick={fetchAllUsers}>Refresh</button>
          </div>
          <div className="table-scroll-area">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Platform</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length > 0 ? (
                  usersList.map(user => (
                    <tr key={user.id}>
                      <td className="font-medium text-white">{user.fullName || 'N/A'}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.platform ? (
                          <span className="platform-badge">{user.platform}</span>
                        ) : '-'}
                      </td>
                      <td>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="live-feed-sidebar session-card">
          <div className="live-feed-header">
            <h3>Live Activity Feed</h3>
            <div className="pulse-dot"></div>
          </div>
          
          <div className="feed-list">
            <AnimatePresence>
              {recentLogins.length > 0 ? (
                recentLogins.map((login, idx) => (
                  <motion.div 
                    key={idx}
                    className="feed-item"
                    initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                    animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="feed-icon">
                      {login.type === 'registration' ? '🎉' : '🟢'}
                    </div>
                    <div className="feed-details">
                      <p className="feed-user">{login.fullName || login.email}</p>
                      <p className="feed-action">
                        {login.type === 'registration' ? 'Created an account' : 'Logged in'}
                      </p>
                      <span className="feed-time">{login.loginTime}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="empty-feed">Waiting for live events...</p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCreatorsManagement = () => (
    <motion.div 
      className="tab-content"
      key="creators"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1>Creators Showcase</h1>
        <p>Manage the dynamic marquee of featured creators on the landing page.</p>
      </div>

      <div className="admin-card">
        <h3 className="card-title">Add New Creator</h3>
        <form onSubmit={handleAddCreator} className="creator-add-form">
          <div className="input-row">
            <div className="input-group">
              <label>Creator Name</label>
              <input type="text" name="name" value={creatorForm.name} onChange={handleCreatorFormChange} placeholder="e.g. Priya Sharma" required />
            </div>
            <div className="input-group">
              <label>Handle</label>
              <input type="text" name="handle" value={creatorForm.handle} onChange={handleCreatorFormChange} placeholder="e.g. @priyasharma_live" required />
            </div>
            <div className="input-group">
              <label>Followers</label>
              <input type="text" name="followers" value={creatorForm.followers} onChange={handleCreatorFormChange} placeholder="e.g. 2.1M" required />
            </div>
          </div>
          <div className="input-group full-width">
            <label>Image Upload (High Quality Portrait)</label>
            <input type="file" name="image" accept="image/*" onChange={handleCreatorFormChange} required />
          </div>
          <button type="submit" className="admin-btn-primary" disabled={isUploadingCreator}>
            {isUploadingCreator ? 'Uploading to Cloudinary...' : 'Upload & Add Creator'}
          </button>
        </form>
      </div>

      <div className="admin-card mt-4">
        <h3 className="card-title">Active Creators ({creatorsList.length})</h3>
        <div className="creators-grid">
          {creatorsList.map(creator => (
            <div key={creator.id} className="admin-creator-card">
              <img src={creator.imageUrl} alt={creator.name} className="admin-creator-img" />
              <div className="admin-creator-info">
                <h4>{creator.name}</h4>
                <p>{creator.handle}</p>
                <span>{creator.followers} followers</span>
              </div>
              <button className="admin-btn-danger" onClick={() => handleDeleteCreator(creator.id)}>Remove</button>
            </div>
          ))}
          {creatorsList.length === 0 && <p className="text-gray-400">No creators found. Add one above.</p>}
        </div>
      </div>
    </motion.div>
  );

  const renderFeaturedTalent = () => (
    <motion.div 
      className="tab-content"
      key="talent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1>Featured Talent</h1>
        <p>Manage the large "Meet the Talent" cards on the landing page.</p>
      </div>

      <div className="admin-card">
        <h3 className="card-title">Add Featured Talent</h3>
        <form onSubmit={handleAddTalent} className="creator-add-form">
          <div className="input-row">
            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" value={talentForm.name} onChange={handleTalentFormChange} placeholder="e.g. Amara Chen" required />
            </div>
            <div className="input-group">
              <label>Handle</label>
              <input type="text" name="handle" value={talentForm.handle} onChange={handleTalentFormChange} placeholder="e.g. @amaracreates" required />
            </div>
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>Category</label>
              <input type="text" name="category" value={talentForm.category} onChange={handleTalentFormChange} placeholder="e.g. LIFESTYLE & WELLNESS" required />
            </div>
            <div className="input-group">
              <label>Platform</label>
              <input type="text" name="platform" value={talentForm.platform} onChange={handleTalentFormChange} placeholder="e.g. YOUTUBE" required />
            </div>
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>Followers</label>
              <input type="text" name="followers" value={talentForm.followers} onChange={handleTalentFormChange} placeholder="e.g. 3.2M" required />
            </div>
            <div className="input-group">
              <label>Badges (Comma separated)</label>
              <input type="text" name="badges" value={talentForm.badges} onChange={handleTalentFormChange} placeholder="e.g. Forbes 30U30, Vogue Feature" />
            </div>
          </div>
          <div className="input-group full-width">
            <label>Image Upload</label>
            <input type="file" name="image" accept="image/*" onChange={handleTalentFormChange} required />
          </div>
          <button type="submit" className="admin-btn-primary" disabled={isUploadingTalent}>
            {isUploadingTalent ? 'Uploading...' : 'Upload & Add Talent'}
          </button>
        </form>
      </div>

      <div className="admin-card mt-4">
        <h3 className="card-title">Active Talent ({talentList.length}/4)</h3>
        <p className="text-sm text-gray-400 mb-4">Note: The landing page will only display the 4 most recently added talents.</p>
        <div className="creators-grid">
          {talentList.map(talent => (
            <div key={talent.id} className="admin-creator-card">
              <img src={talent.imageUrl} alt={talent.name} className="admin-creator-img" />
              <div className="admin-creator-info">
                <h4>{talent.name}</h4>
                <p>{talent.category} • {talent.platform}</p>
                <span>{talent.followers} followers</span>
              </div>
              <button className="admin-btn-danger" onClick={() => handleDeleteTalent(talent.id)}>Remove</button>
            </div>
          ))}
          {talentList.length === 0 && <p className="text-gray-400">No featured talent found.</p>}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="admin-layout">
      {renderSidebar()}
      <main className="admin-content-area">
        <header className="admin-topbar">
          <div className="topbar-left">
            <span className="greeting">Welcome back, Admin</span>
          </div>
          <div className="topbar-right">
             <div className="admin-profile">
               <div className="avatar">A</div>
             </div>
          </div>
        </header>
        
        <div className="admin-main-scroll">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'featured' && renderFeaturedVideos()}
            {activeTab === 'auth' && renderAuthSessions()}
            {activeTab === 'users' && renderUsersManagement()}
            {activeTab === 'creators' && renderCreatorsManagement()}
            {activeTab === 'talent' && renderFeaturedTalent()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
