import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/animations';
import { Link } from 'react-router-dom';
import { socket } from '../socket/socketManager';
import './CreatorsMarquee.css';

const CreatorCard = ({ creator }) => (
  <div className="creator-card">
    <img src={creator.image} alt={creator.name} className="creator-image" />
    <div className="creator-overlay">
      <h4 className="creator-name">{creator.name}</h4>
      <p className="creator-stats">
        <span className="creator-platform">{creator.handle}</span>
        <span className="creator-dot">·</span>
        <span>{creator.followers}</span>
      </p>
    </div>
  </div>
);

const CreatorsMarquee = () => {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/creators`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.creators && data.creators.length > 0) {
            setCreators(data.creators.map(c => ({ ...c, image: c.imageUrl })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch creators', error);
      }
    };
    fetchCreators();

    // Listen for live updates
    const handleContentUpdated = (data) => {
      if (data && data.type === 'creator') {
        fetchCreators();
      }
    };

    socket.on('content:updated', handleContentUpdated);

    return () => {
      socket.off('content:updated', handleContentUpdated);
    };
  }, []);

  // We duplicate the array to ensure seamless infinite scrolling
  const row1 = [...creators, ...creators];

  // Create a second row with a different order or offset
  const row2Creators = [...creators].reverse();
  const row2 = [...row2Creators, ...row2Creators];

  if (creators.length === 0) {
    return null;
  }

  return (
    <section className="creators-marquee-section">
      <div className="marquee-controls">
         <Link to="/admin" className="add-creator-btn-small">
            + Manage Creators
         </Link>
      </div>
      <motion.div
        className="marquee-container"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >

        {/* Row 1 - scrolling left */}
        <div className="marquee-row marquee-left">
          <div className="marquee-track">
            {row1.map((creator, index) => (
              <CreatorCard key={`row1-${index}`} creator={creator} />
            ))}
          </div>
        </div>

        {/* Row 2 - scrolling right */}
        <div className="marquee-row marquee-right">
          <div className="marquee-track-reverse">
            {row2.map((creator, index) => (
              <CreatorCard key={`row2-${index}`} creator={creator} />
            ))}
          </div>
        </div>

      </motion.div>
    </section>
  );
};

export default CreatorsMarquee;
