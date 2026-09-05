import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/animations';
import { Link } from 'react-router-dom';
import { useCreatorRoster } from '../hooks/useCreatorRoster';
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
  const { creators, loading } = useCreatorRoster();

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
