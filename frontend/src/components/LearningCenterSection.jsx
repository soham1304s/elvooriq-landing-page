import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { socket } from '../socket/socketManager';
import './LearningCenterSection.css';

const LearningCenterSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const normalized = url.trim();
    const regex = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?&]+).*/;
    const match = normalized.match(regex);
    const candidate = match && match[1] ? match[1] : normalized;
    return candidate && candidate.length === 11 ? candidate : null;
  };

  useEffect(() => {
    const fetchFeaturedVideos = async () => {
      try {
        const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/featured/videos`);
        if (res.ok) {
          const data = await res.json();
          setVideos(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch featured videos:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleVideosUpdate = (data) => {
      setVideos(Array.isArray(data) ? data : []);
    };

    fetchFeaturedVideos();
    socket.on('landing:featured_videos_update', handleVideosUpdate);

    return () => {
      socket.off('landing:featured_videos_update', handleVideosUpdate);
    };
  }, []);

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
              <span className="section-subtitle">LEARNING CENTER</span>
            </div>
            <h2 className="learning-title">
              Watch the<br/>
              <span className="title-highlight">Movement Unfold</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="learning-header-right">
            <button className="view-all-btn" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>
              View All
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="learning-video-grid"
          variants={staggerContainer}
          initial="visible"
          animate="visible"
        >
          {loading ? (
            <motion.div variants={fadeInUp} className="video-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              Loading featured videos...
            </motion.div>
          ) : videos.length === 0 ? (
            <motion.div variants={fadeInUp} className="video-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              No featured videos yet. Add videos from the admin panel.
            </motion.div>
          ) : (
            videos.slice(0, 3).map((video) => {
              const videoId = getYouTubeId(video.youtubeUrl);
              const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/videos/clapperboard.png';
              return (
                <motion.div key={video.id} variants={fadeInUp} className="video-card">
                  <a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="video-thumbnail-container">
                    <img src={thumbnail} alt={video.title || 'Featured video'} className="video-thumbnail" />
                    <div className="video-overlay"></div>
                    <div className="video-icon-top">
                      <Play size={16} />
                    </div>
                    <div className="video-play-btn">
                      <Play size={24} className="play-triangle" />
                    </div>
                    <div className="video-duration">LIVE</div>
                  </a>
                  <div className="video-details">
                    <h4 className="video-title">{video.title || 'Untitled broadcast'}</h4>
                    <p className="video-views">Featured video from admin</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="video-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target.classList.contains('video-modal-overlay')) setIsModalOpen(false);
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
                <h2>All Featured Videos</h2>
                <button className="video-modal-close" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="video-modal-grid">
                {videos.map((video) => {
                  const videoId = getYouTubeId(video.youtubeUrl);
                  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/videos/clapperboard.png';
                  return (
                    <div key={video.id} className="video-card">
                      <a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="video-thumbnail-container">
                        <img src={thumbnail} alt={video.title || 'Featured video'} className="video-thumbnail" />
                        <div className="video-overlay"></div>
                        <div className="video-icon-top">
                          <Play size={16} />
                        </div>
                        <div className="video-play-btn">
                          <Play size={24} className="play-triangle" />
                        </div>
                        <div className="video-duration">LIVE</div>
                      </a>
                      <div className="video-details">
                        <h4 className="video-title">{video.title || 'Untitled broadcast'}</h4>
                        <p className="video-views">Featured video from admin</p>
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
