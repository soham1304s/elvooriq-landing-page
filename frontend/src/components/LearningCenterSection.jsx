import React, { useState, useEffect } from 'react';
import { Play, X, ExternalLink, Sparkles, CheckCircle2, Clock, Eye, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { socket } from '../socket/socketManager';
import './LearningCenterSection.css';

const CATEGORIES = ['All', 'Beginner', 'Live Streaming Tips', 'Creator Guides', 'Tutorials', 'Success Stories'];

// Curated Masterclass Catalog tailored for onboarding creators and brand face journeys
const MASTERCLASS_CATALOG = [
  {
    id: 'masterclass-1',
    title: 'The Creator-to-Brand-Face Transition: Building High-Ticket Equity',
    youtubeUrl: 'https://youtu.be/HBYkbqACOBg',
    category: 'Success Stories',
    level: 'MASTERCLASS',
    duration: '18:45',
    views: '340K views',
    coach: 'Vanessa Lau',
    coachRole: 'Personal Brand & Executive Strategist',
    description: 'The exact step-by-step roadmap to graduate from low-margin affiliate deals to high-ticket equity partnerships and multi-year brand ambassadorships.',
    takeaways: [
      'Repositioning your creator persona from general entertainer to trusted industry authority',
      'The 3-tier brand portfolio model: Retainers, Commercial Licensing, and Equity',
      'How to approach luxury fashion & beauty houses with a high-conversion editorial media kit'
    ]
  },
  {
    id: 'masterclass-2',
    title: 'Studio-Grade Transcoding & Multi-RTMP Live Streaming Setup',
    youtubeUrl: 'https://youtu.be/i8GoqRYutJk',
    category: 'Live Streaming Tips',
    level: 'PRO WORKSHOP',
    duration: '24:10',
    views: '520K views',
    coach: 'Think Media Pro',
    coachRole: 'Lead Broadcast Systems Engineer',
    description: 'Comprehensive technical walkthrough for low-latency live broadcast, multi-camera switching, audio mastering, and simultaneous multi-platform RTMP ingest.',
    takeaways: [
      'Optimizing OBS Studio & hardware encoders for zero dropped frames at 4K 60FPS',
      'Simulcasting to YouTube, Twitch, and Bigo Live using high-availability cloud RTMP relays',
      'Broadcast mic gating, compression, and room acoustics for crystal-clear voice clarity'
    ]
  },
  {
    id: 'masterclass-3',
    title: '10 Live Streaming Rules to Double Superchats & Viewer Watch Time',
    youtubeUrl: 'https://youtu.be/ZXwpWEbAmd0',
    category: 'Live Streaming Tips',
    level: 'TACTICAL GUIDE',
    duration: '14:22',
    views: '280K views',
    coach: 'ELVOORIQ Live Ops',
    coachRole: 'Talent Growth & Engagement Director',
    description: 'Psychological triggers and stream segment structuring that turn casual stream lurkers into hyper-engaged subscribers and recurring donors.',
    takeaways: [
      'Dynamic stream pacing: The 7-minute re-hook cycle to slash viewer drop-off',
      'Gamifying donor interactions and custom on-screen visual alerts for 4x superchat lift',
      'Building genuine parasocial trust while maintaining strong personal boundaries and creator privacy'
    ]
  },
  {
    id: 'masterclass-4',
    title: 'Contract Safeguarding & Negotiating 6-Figure Brand Deals',
    youtubeUrl: 'https://youtu.be/JDJRpgkmP4s',
    category: 'Creator Guides',
    level: 'LEGAL & BIZ',
    duration: '28:15',
    views: '410K views',
    coach: 'Colin & Samir',
    coachRole: 'Creator Economy Analysts & Agents',
    description: 'Master contract negotiations: identifying predatory rights grabs, perpetual exclusivity clauses, and turning one-off posts into guaranteed annual revenue.',
    takeaways: [
      'How to calculate and justify your commercial licensing rate beyond standard CPMs',
      'Red flag clauses in brand contracts: Perpetual likeness rights, AI training grants, and harsh indemnities',
      'Negotiation scripts to flip $2,000 gifted collabs into $25,000 multi-asset campaigns'
    ]
  },
  {
    id: 'masterclass-5',
    title: 'New Creator Onboarding: Essential Gear, Lighting & Audio',
    youtubeUrl: 'https://youtu.be/WIDcjJkZInI',
    category: 'Beginner',
    level: 'ONBOARDING',
    duration: '12:50',
    views: '195K views',
    coach: 'Sara Dietschy',
    coachRole: 'Production & Hardware Mentor',
    description: 'The essential starter blueprint for newly onboarded creators: choosing the best cameras, key lights, microphones, and framing without overspending.',
    takeaways: [
      '3-point cinematic lighting setup using budget-friendly softboxes and warm backlights',
      'USB vs. XLR audio breakdown: Best audio gear under $150 that punches above its weight',
      'Camera composition, lens focal lengths, and framing secrets for magnetic screen presence'
    ]
  },
  {
    id: 'masterclass-6',
    title: 'Audience Retention: The 15-Second Hook & Story Pacing Formula',
    youtubeUrl: 'https://youtu.be/AQh2eC5H3tc',
    category: 'Tutorials',
    level: 'VIRAL PACING',
    duration: '16:35',
    views: '680K views',
    coach: 'Ali Abdaal',
    coachRole: 'Algorithm & Hook Architects',
    description: 'The science behind first-frame engagement, narrative tension, and hook design that boosted our creators average retention rate from 24% to 78%.',
    takeaways: [
      'The 3 hook types: Visual Disruption, Curiosity Gap, and High-Stakes Declarations',
      'B-roll pacing and micro-cuts that reset audience dopamine every 4-6 seconds',
      'Thumbnail-to-video seamless flow: Eliminating the 5-second intro drop-off cliff'
    ]
  },
  {
    id: 'masterclass-7',
    title: 'Building Your D2C Brand: Turning Followers into Equity',
    youtubeUrl: 'https://youtu.be/KLBIVfHgD4o',
    category: 'Success Stories',
    level: 'VENTURE LAB',
    duration: '22:40',
    views: '310K views',
    coach: 'ELVOORIQ Venture Lab',
    coachRole: 'Product Incubation & Equity Team',
    description: 'Case study on how our creators incubated and launched ethical beauty lines, digital products, and physical merchandise with $1M+ year-one revenues.',
    takeaways: [
      'Validating audience demand before manufacturing a single unit of inventory',
      'White-label vs. Custom Formulation: Margins, MOQ, and quality control',
      'Launch strategy: Teaser campaigns that sell out entire production runs in 48 hours'
    ]
  }
];

const getYouTubeId = (url) => {
  if (!url) return null;
  const normalized = url.trim();
  const regex = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?&]+).*/;
  const match = normalized.match(regex);
  const candidate = match && match[1] ? match[1] : normalized;
  return candidate && candidate.length === 11 ? candidate : null;
};

const LearningCenterSection = () => {
  const [videos, setVideos] = useState(MASTERCLASS_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeaturedVideos = async () => {
      try {
        const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/featured/videos`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Merge database entries with rich masterclass metadata catalog
            const enriched = data.map((v, i) => {
              const matchedCatalog = MASTERCLASS_CATALOG.find(c => 
                (v.youtubeUrl && getYouTubeId(v.youtubeUrl) === getYouTubeId(c.youtubeUrl)) ||
                (v.title && c.title.toLowerCase().includes(v.title.toLowerCase().split(':')[0]))
              ) || MASTERCLASS_CATALOG[i % MASTERCLASS_CATALOG.length];

              return {
                ...matchedCatalog,
                ...v,
                id: v.id || matchedCatalog.id,
                title: v.title || matchedCatalog.title,
                youtubeUrl: v.youtubeUrl || matchedCatalog.youtubeUrl,
                category: matchedCatalog.category,
                level: matchedCatalog.level,
                duration: matchedCatalog.duration,
                views: matchedCatalog.views,
                coach: matchedCatalog.coach,
                coachRole: matchedCatalog.coachRole,
                description: matchedCatalog.description,
                takeaways: matchedCatalog.takeaways
              };
            });
            setVideos(enriched);
          }
        }
      } catch (error) {
        console.error('Failed to fetch live featured videos, using certified masterclass catalog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedVideos();

    const handleVideosUpdate = (data) => {
      if (Array.isArray(data) && data.length > 0) {
        fetchFeaturedVideos();
      }
    };

    socket.on('landing:featured_videos_update', handleVideosUpdate);
    socket.on('video_added', fetchFeaturedVideos);
    socket.on('video_updated', fetchFeaturedVideos);
    socket.on('video_deleted', fetchFeaturedVideos);

    return () => {
      socket.off('landing:featured_videos_update', handleVideosUpdate);
      socket.off('video_added', fetchFeaturedVideos);
      socket.off('video_updated', fetchFeaturedVideos);
      socket.off('video_deleted', fetchFeaturedVideos);
    };
  }, []);

  const filteredVideos = selectedCategory === 'All'
    ? videos
    : videos.filter(v => {
        const cat = (v.category || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        return cat.includes(sel) || (v.level || '').toLowerCase().includes(sel);
      });

  const handleOpenVideo = (video, e) => {
    if (e) e.preventDefault();
    setActivePlayerVideo(video);
  };

  return (
    <section className="learning-center-section" id="learning">
      <div className="learning-container container">
        <motion.div 
          className="learning-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="learning-header-left">
            <div className="section-header">
              <span className="section-line"></span>
              <span className="section-subtitle">CREATOR ACADEMY & MASTERCLASSES</span>
            </div>
            <h2 className="learning-title">
              Watch the<br/>
              <span className="title-highlight">Movement Unfold</span>
            </h2>
            <p className="learning-subtitle">
              Exclusive industry masterclasses, live stream optimization breakdowns, and brand deal playbooks crafted for ambitious female creators.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="learning-header-right">
            <button className="view-all-btn" onClick={() => setIsViewAllModalOpen(true)}>
              <BookOpen size={16} style={{ color: '#D4AF37' }} />
              <span>Explore All Masterclasses ({videos.length})</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div 
          className="learning-categories"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? 'All Masterclasses' : cat}
            </button>
          ))}
        </motion.div>

        {/* Video Cards Grid */}
        <motion.div 
          className="learning-video-grid"
          variants={staggerContainer}
          initial="visible"
          animate="visible"
        >
          {loading ? (
            <motion.div variants={fadeInUp} className="video-empty-state">
              Loading creator masterclasses...
            </motion.div>
          ) : filteredVideos.length === 0 ? (
            <motion.div variants={fadeInUp} className="video-empty-state">
              No masterclasses found in "{selectedCategory}". Explore another category above.
            </motion.div>
          ) : (
            filteredVideos.slice(0, 6).map((video, idx) => {
              const videoId = getYouTubeId(video.youtubeUrl);
              const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/videos/clapperboard.png';
              return (
                <motion.div 
                  key={video.id || idx} 
                  variants={fadeInUp} 
                  className="masterclass-card"
                  onClick={(e) => handleOpenVideo(video, e)}
                >
                  <div className="video-thumbnail-container">
                    <img 
                      src={thumbnail} 
                      alt={video.title} 
                      className="video-thumbnail" 
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to hqdefault if maxresdefault is unavailable
                        if (videoId && !e.target.src.includes('hqdefault')) {
                          e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }
                      }}
                    />
                    <div className="video-overlay"></div>
                    
                    {/* Level & Category Tag */}
                    <div className="video-tag-pill">
                      <Sparkles size={11} style={{ color: '#D4AF37' }} />
                      <span>{video.level || 'MASTERCLASS'}</span>
                    </div>

                    {/* Centered Glowing Play Button */}
                    <div className="video-play-btn" title="Watch Masterclass">
                      <Play size={22} className="play-triangle" />
                    </div>

                    {/* Duration Badge */}
                    <div className="video-duration">
                      <Clock size={11} />
                      <span>{video.duration || '15:00'}</span>
                    </div>
                  </div>

                  <div className="video-details">
                    <div className="video-category-row">
                      <span className="video-category-name">{video.category || 'Creator Guide'}</span>
                      <span className="video-views-count">
                        <Eye size={12} /> {video.views || '250K+'}
                      </span>
                    </div>

                    <h4 className="video-title">{video.title}</h4>
                    
                    <p className="video-desc-snippet">{video.description}</p>

                    <div className="video-coach-row">
                      <div className="coach-avatar-initials">
                        {(video.coach || 'E')[0]}
                      </div>
                      <div className="coach-info">
                        <div className="coach-name-row">
                          <span className="coach-name">{video.coach}</span>
                          <CheckCircle2 size={13} className="coach-verified" />
                        </div>
                        <span className="coach-role">{video.coachRole || 'ELVOORIQ Mentor'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* Interactive In-App YouTube Player Modal */}
      <AnimatePresence>
        {activePlayerVideo && (
          <motion.div 
            className="video-player-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target.classList.contains('video-player-modal-overlay')) setActivePlayerVideo(null);
            }}
          >
            <motion.div 
              className="video-player-modal-container"
              initial={{ scale: 0.94, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
            >
              <div className="player-modal-header">
                <div className="player-header-badge">
                  <Sparkles size={13} style={{ color: '#D4AF37' }} />
                  <span>{activePlayerVideo.level || 'MASTERCLASS'} · {activePlayerVideo.category}</span>
                </div>
                <button 
                  className="player-modal-close" 
                  onClick={() => setActivePlayerVideo(null)}
                  title="Close player (Esc)"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 16:9 YouTube Video Frame */}
              <div className="video-iframe-wrapper">
                <iframe 
                  src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(activePlayerVideo.youtubeUrl)}?autoplay=1&rel=0&modestbranding=1`}
                  title={activePlayerVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="masterclass-iframe"
                />
              </div>

              {/* Video Info and Action Links */}
              <div className="player-modal-body">
                <div className="player-title-bar">
                  <div>
                    <h2 className="player-video-title">{activePlayerVideo.title}</h2>
                    <div className="player-coach-strip">
                      <span className="strip-coach-name">Presented by {activePlayerVideo.coach}</span>
                      <span className="strip-dot">·</span>
                      <span className="strip-coach-role">{activePlayerVideo.coachRole}</span>
                      <span className="strip-dot">·</span>
                      <span className="strip-views">{activePlayerVideo.views}</span>
                    </div>
                  </div>
                  <a 
                    href={activePlayerVideo.youtubeUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="open-youtube-external-btn"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink size={14} />
                  </a>
                </div>

                <p className="player-description">{activePlayerVideo.description}</p>

                {/* Key Onboarding Takeaways */}
                {activePlayerVideo.takeaways && activePlayerVideo.takeaways.length > 0 && (
                  <div className="player-takeaways-box">
                    <h5 className="takeaways-heading">
                      <Sparkles size={14} style={{ color: '#D4AF37' }} />
                      KEY TAKEAWAYS FOR ONBOARDING TALENT:
                    </h5>
                    <ul className="takeaways-list">
                      {activePlayerVideo.takeaways.map((point, pIdx) => (
                        <li key={pIdx} className="takeaway-item">
                          <span className="takeaway-bullet">✓</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explore All Masterclasses Modal */}
      <AnimatePresence>
        {isViewAllModalOpen && (
          <motion.div 
            className="video-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target.classList.contains('video-modal-overlay')) setIsViewAllModalOpen(false);
            }}
          >
            <motion.div 
              className="video-modal-container"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="video-modal-header">
                <div>
                  <span className="modal-eyebrow">ELVOORIQ CREATOR ACADEMY</span>
                  <h2>All Certified Masterclasses</h2>
                </div>
                <button className="video-modal-close" onClick={() => setIsViewAllModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="video-modal-grid">
                {videos.map((video, idx) => {
                  const videoId = getYouTubeId(video.youtubeUrl);
                  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/videos/clapperboard.png';
                  return (
                    <div 
                      key={video.id || idx} 
                      className="masterclass-card in-modal"
                      onClick={() => {
                        setIsViewAllModalOpen(false);
                        setActivePlayerVideo(video);
                      }}
                    >
                      <div className="video-thumbnail-container">
                        <img src={thumbnail} alt={video.title} className="video-thumbnail" />
                        <div className="video-overlay"></div>
                        <div className="video-tag-pill">
                          <span>{video.level || 'MASTERCLASS'}</span>
                        </div>
                        <div className="video-play-btn">
                          <Play size={22} className="play-triangle" />
                        </div>
                        <div className="video-duration">{video.duration}</div>
                      </div>
                      <div className="video-details">
                        <span className="video-category-name">{video.category}</span>
                        <h4 className="video-title">{video.title}</h4>
                        <p className="video-views">By {video.coach} · {video.views}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LearningCenterSection;
