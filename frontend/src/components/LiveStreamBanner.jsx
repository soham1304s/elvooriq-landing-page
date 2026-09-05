import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket/socketManager';

const LiveStreamBanner = () => {
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchFeaturedVideos = async () => {
      try {
        const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/featured/videos`);
        if (res.ok) {
          const data = await res.json();
          const firstVideo = Array.isArray(data) && data.length > 0 ? data[0] : null;
          if (firstVideo && firstVideo.youtubeUrl) {
            setFeaturedVideo(firstVideo);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch featured video:', error);
      }
    };

    fetchFeaturedVideos();

    const handleVideosUpdate = (data) => {
      const firstVideo = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (firstVideo && firstVideo.youtubeUrl) {
        setFeaturedVideo(firstVideo);
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setTimeout(() => setFeaturedVideo(null), 500);
      }
    };

    socket.on('landing:featured_videos_update', handleVideosUpdate);

    return () => {
      socket.off('landing:featured_videos_update', handleVideosUpdate);
    };
  }, []);

  // Helper to extract YouTube ID from standard URLs or IDs
  const getYouTubeId = (url) => {
    if (!url) return null;
    const normalized = url.trim();
    const regex = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?&]+).*/;
    const match = normalized.match(regex);
    const candidate = match && match[1] ? match[1] : normalized;
    return candidate && candidate.length === 11 ? candidate : null;
  };

  const videoId = featuredVideo ? getYouTubeId(featuredVideo.youtubeUrl) : null;

  if (!videoId) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && featuredVideo && (
        <motion.section
          className="live-stream-banner"
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            padding: '40px 20px',
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 184, 255, 0.05))',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ff0055',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 0 20px rgba(255, 0, 85, 0.4)',
              animation: 'pulse 2s infinite',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'inline-block' }}></span>
            Featured Live
          </div>

          <motion.div 
            className="video-container"
            style={{
              width: '100%',
              maxWidth: '960px',
              marginTop: '20px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#000',
              aspectRatio: '16/9'
            }}
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getYouTubeId(featuredVideo.youtubeUrl)}?autoplay=1&mute=1`}
              title={featuredVideo.title || "Elvooriq Live Stream"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </motion.div>
          {featuredVideo.title && (
            <h3 style={{ marginTop: '20px', fontSize: '24px', fontWeight: '600', color: '#fff', textAlign: 'center' }}>
              {featuredVideo.title}
            </h3>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default LiveStreamBanner;
